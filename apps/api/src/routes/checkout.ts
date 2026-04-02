import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getSessionUser, requireSessionUser } from '../auth/session.js';
import { addDays, asMoney, getCatalogItemBySlug, mapCatalogItem } from '../platform.js';

type CheckoutBody = {
  product?: string;
  couponCode?: string;
  quantity?: number;
  shipping?: {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
};

type CouponRow = {
  code: string;
  discount_type: 'percent' | 'flat' | 'free';
  amount: string | number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  usage_limit: number | null;
  used_count: number;
  applicable_types: string[] | null;
  applicable_slugs: string[] | null;
  applicable_emails: string[] | null;
};

type CourseAccessRow = {
  id: string;
  access_type: 'lifetime' | 'fixed_months';
  access_months: number | null;
};

function validateBookPin(pin: string): boolean {
  return /^\d{6}$/.test(pin) && !pin.startsWith('0');
}

function createOrderNumber(): string {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LH-${stamp}-${rand}`;
}

function addMonths(months: number | null): Date | null {
  if (!months || months <= 0) return null;
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function computeDiscount(
  coupon: CouponRow | null,
  subtotal: number,
  itemType: string,
  itemSlug: string,
  userEmail: string
): number {
  if (!coupon) return 0;
  if (!coupon.is_active) return 0;
  if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) return 0;
  if (coupon.valid_to && new Date(coupon.valid_to) < new Date()) return 0;
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return 0;
  if ((coupon.applicable_types?.length ?? 0) > 0 && !coupon.applicable_types?.includes(itemType)) return 0;
  if ((coupon.applicable_slugs?.length ?? 0) > 0 && !coupon.applicable_slugs?.includes(itemSlug)) return 0;
  if ((coupon.applicable_emails?.length ?? 0) > 0 && !coupon.applicable_emails?.includes(userEmail)) return 0;

  if (coupon.discount_type === 'free') return subtotal;
  if (coupon.discount_type === 'flat') return Math.min(subtotal, asMoney(coupon.amount));
  return Math.min(subtotal, Number(((subtotal * asMoney(coupon.amount)) / 100).toFixed(2)));
}

async function loadCoupon(sql: NeonQueryFunction<false, false>, code?: string): Promise<CouponRow | null> {
  if (!code) return null;
  const couponCode = code.trim().toUpperCase();
  if (!couponCode) return null;
  const rows = (await sql`
    SELECT *
    FROM coupons
    WHERE code = ${couponCode}
    LIMIT 1
  `) as CouponRow[];
  return rows[0] ?? null;
}

async function loadCourseAccess(sql: NeonQueryFunction<false, false>, slug: string): Promise<CourseAccessRow | null> {
  const rows = (await sql`
    SELECT id, access_type, access_months
    FROM courses
    WHERE slug = ${slug}
    LIMIT 1
  `) as CourseAccessRow[];
  return rows[0] ?? null;
}

function resolveAccessExpiry(
  item: Awaited<ReturnType<typeof getCatalogItemBySlug>> extends infer T ? NonNullable<T> : never,
  courseAccess: CourseAccessRow | null
): Date | null {
  if (courseAccess) {
    return courseAccess.access_type === 'fixed_months'
      ? addMonths(courseAccess.access_months)
      : null;
  }
  return addDays(item.validity_days);
}

export function createCheckoutRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.post('/quote', async (req, res) => {
    try {
      const user = await getSessionUser(req, sql);
      const body = (req.body ?? {}) as CheckoutBody;
      const slug = typeof body.product === 'string' ? body.product.trim() : '';
      if (!slug) {
        res.status(400).json({ error: 'Product is required.' });
        return;
      }

      const item = await getCatalogItemBySlug(sql, slug);
      if (!item) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      const quantity = item.type === 'physical_book' ? Math.max(1, Math.min(body.quantity ?? 1, 10)) : 1;
      if (item.type === 'physical_book' && item.stock_quantity !== null && item.stock_quantity < quantity) {
        res.status(400).json({ error: 'This book is currently out of stock.' });
        return;
      }

      const coupon = await loadCoupon(sql, body.couponCode);
      const subtotal = roundMoney(asMoney(item.price) * quantity);
      const discount = computeDiscount(coupon, subtotal, item.type, item.slug, user?.email ?? '');
      const total = roundMoney(Math.max(0, subtotal - discount));

      const requiresShipping = item.type === 'physical_book';
      const pinCode = body.shipping?.pinCode?.trim() ?? '';
      const deliveryAvailable = requiresShipping && pinCode ? validateBookPin(pinCode) : undefined;

      res.json({
        item: mapCatalogItem(item),
        pricing: { quantity, subtotal, discount, total, currency: item.currency },
        coupon: coupon ? { code: coupon.code, applied: discount > 0 } : null,
        shipping: requiresShipping ? { required: true, deliveryAvailable } : { required: false },
      });
    } catch (e) {
      console.error('checkout.quote', e);
      res.status(500).json({ error: 'Could not prepare checkout.' });
    }
  });

  router.post('/purchase', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const body = (req.body ?? {}) as CheckoutBody;
      const slug = typeof body.product === 'string' ? body.product.trim() : '';
      if (!slug) {
        res.status(400).json({ error: 'Product is required.' });
        return;
      }

      const item = await getCatalogItemBySlug(sql, slug);
      if (!item) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      const quantity = item.type === 'physical_book' ? Math.max(1, Math.min(body.quantity ?? 1, 10)) : 1;
      if (item.type === 'physical_book' && item.stock_quantity !== null && item.stock_quantity < quantity) {
        res.status(400).json({ error: 'This book is currently out of stock.' });
        return;
      }

      if (item.type === 'physical_book') {
        const shipping = body.shipping;
        if (
          !shipping?.fullName ||
          !shipping.email ||
          !shipping.phone ||
          !shipping.addressLine ||
          !shipping.pinCode
        ) {
          res.status(400).json({ error: 'Shipping details are required for physical books.' });
          return;
        }
        if (!validateBookPin(shipping.pinCode.trim())) {
          res.status(400).json({ error: 'Delivery is not available for this PIN code yet.' });
          return;
        }
      }

      const coupon = await loadCoupon(sql, body.couponCode);
      const subtotal = roundMoney(asMoney(item.price) * quantity);
      const discount = computeDiscount(coupon, subtotal, item.type, item.slug, user.email);
      const total = roundMoney(Math.max(0, subtotal - discount));
      const orderNumber = createOrderNumber();
      const courseAccess = item.type === 'course' ? await loadCourseAccess(sql, item.slug) : null;

      const orderRows = await sql`
        INSERT INTO orders (
          order_number,
          user_id,
          status,
          payment_status,
          payment_provider,
          payment_reference,
          currency,
          subtotal_amount,
          discount_amount,
          total_amount,
          coupon_code,
          billing_name,
          billing_email,
          billing_phone
        )
        VALUES (
          ${orderNumber},
          ${user.id},
          ${item.type === 'physical_book' ? 'shipping' : 'paid'},
          'paid',
          'demo',
          ${`pay_${orderNumber}`},
          ${item.currency},
          ${subtotal},
          ${discount},
          ${total},
          ${coupon?.code ?? null},
          ${user.name},
          ${user.email},
          ${user.phone}
        )
        RETURNING id, order_number
      `;
      const order = orderRows[0] as { id: string; order_number: string };

      const accessExpiry = resolveAccessExpiry(item, courseAccess);
      await sql`
        INSERT INTO order_items (
          order_id,
          item_id,
          item_slug,
          item_type,
          item_title,
          quantity,
          unit_price,
          total_price,
          access_expires_at
        )
        VALUES (
          ${order.id},
          ${item.id},
          ${item.slug},
          ${item.type},
          ${item.title},
          ${quantity},
          ${asMoney(item.price)},
          ${total},
          ${accessExpiry}
        )
      `;

      if (coupon && discount > 0) {
        await sql`
          UPDATE coupons
          SET used_count = used_count + 1
          WHERE code = ${coupon.code}
        `;
      }

      if (item.type === 'physical_book') {
        const shipping = body.shipping!;
        await sql`
          INSERT INTO book_shipments (
            order_id,
            item_id,
            full_name,
            email,
            phone,
            address_line,
            city,
            state,
            pin_code,
            delivery_available,
            shipment_status
          )
          VALUES (
            ${order.id},
            ${item.id},
            ${shipping.fullName!},
            ${shipping.email!},
            ${shipping.phone!},
            ${shipping.addressLine!},
            ${shipping.city ?? null},
            ${shipping.state ?? null},
            ${shipping.pinCode!},
            TRUE,
            'processing'
          )
        `;
        await sql`
          UPDATE catalog_items
          SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - ${quantity}, 0)
          WHERE id = ${item.id}
        `;
      } else {
        const remainingAttempts = item.type === 'practice_exam' ? item.attempts_allowed : null;
        await sql`
          INSERT INTO user_entitlements (
            user_id,
            item_id,
            source_order_id,
            status,
            access_expires_at,
            remaining_attempts
          )
          VALUES (
            ${user.id},
            ${item.id},
            ${order.id},
            'active',
            ${accessExpiry},
            ${remainingAttempts}
          )
          ON CONFLICT (user_id, item_id)
          DO UPDATE
          SET
            source_order_id = EXCLUDED.source_order_id,
            status = 'active',
            access_expires_at = COALESCE(EXCLUDED.access_expires_at, user_entitlements.access_expires_at),
            remaining_attempts = CASE
              WHEN EXCLUDED.remaining_attempts IS NULL THEN user_entitlements.remaining_attempts
              WHEN user_entitlements.remaining_attempts IS NULL THEN EXCLUDED.remaining_attempts
              ELSE user_entitlements.remaining_attempts + EXCLUDED.remaining_attempts
            END
        `;

        if (item.type === 'course' && courseAccess) {
          await sql`
            INSERT INTO course_purchases (
              user_id,
              course_id,
              access_expires_at,
              progress_percent,
              completed_lectures
            )
            VALUES (
              ${user.id},
              ${courseAccess.id},
              ${accessExpiry},
              0,
              0
            )
            ON CONFLICT (user_id, course_id)
            DO UPDATE
            SET access_expires_at = EXCLUDED.access_expires_at
          `;
        }
      }

      res.status(201).json({
        ok: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total,
        item: mapCatalogItem(item),
        unlocked: item.type !== 'physical_book',
      });
    } catch (e) {
      console.error('checkout.purchase', e);
      res.status(500).json({ error: 'Could not complete purchase.' });
    }
  });

  return router;
}
