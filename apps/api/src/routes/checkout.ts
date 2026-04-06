import { createHmac, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getSessionUser, requireSessionUser } from '../auth/session.js';
import {
  commitCheckoutPurchase,
  computeDiscount,
  createOrderNumber,
  loadCoupon,
  prepareCheckoutPurchase,
  roundMoney,
  type CheckoutBody,
} from '../checkout-logic.js';
import { asMoney, getCatalogItemBySlug, mapCatalogItem } from '../platform.js';
import { lookupDeliveryAvailability } from '../shipping.js';

function getLiveClassStatus(metadata: Record<string, unknown> | null): string {
  return typeof metadata?.liveClassStatus === 'string' ? metadata.liveClassStatus : 'scheduled';
}

function razorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  if (signature.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch {
    return false;
  }
}

async function razorpayFetch(path: string, init?: RequestInit): Promise<Response> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured');
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export function createCheckoutRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/capabilities', (_req, res) => {
    res.json({
      demo: true,
      razorpay: razorpayConfigured(),
    });
  });

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
      if (item.type === 'live_class') {
        if (getLiveClassStatus(item.metadata) === 'cancelled') {
          res.status(400).json({ error: 'This live class has been cancelled and can no longer be purchased.' });
          return;
        }
        if (item.spots_remaining !== null && item.spots_remaining <= 0) {
          res.status(400).json({ error: 'This live class is sold out.' });
          return;
        }
      }

      const coupon = await loadCoupon(sql, body.couponCode);
      const subtotal = roundMoney(asMoney(item.price) * quantity);
      const discount = computeDiscount(coupon, subtotal, item.type, item.slug, user?.email ?? '');
      const total = roundMoney(Math.max(0, subtotal - discount));

      const requiresShipping = item.type === 'physical_book';
      const pinCode = body.shipping?.pinCode?.trim() ?? '';
      const delivery =
        requiresShipping && pinCode ? await lookupDeliveryAvailability(sql, pinCode) : null;

      res.json({
        item: mapCatalogItem(item),
        pricing: { quantity, subtotal, discount, total, currency: item.currency },
        coupon: coupon ? { code: coupon.code, applied: discount > 0 } : null,
        shipping: requiresShipping
          ? {
              required: true,
              deliveryAvailable: delivery?.available,
              carrier: delivery?.carrier,
              city: delivery?.city,
              state: delivery?.state,
              estimatedDays: delivery?.estimatedDays,
              pinCode: delivery?.pinCode,
              message: delivery?.message,
              trackingBaseUrl: delivery?.trackingBaseUrl,
            }
          : { required: false },
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
      const prepResult = await prepareCheckoutPurchase(sql, user, body);
      if (!prepResult.ok) {
        res.status(prepResult.status).json({ error: prepResult.error });
        return;
      }

      const orderNumber = createOrderNumber();
      const result = await commitCheckoutPurchase(
        sql,
        user,
        body,
        prepResult.prep,
        orderNumber,
        'demo',
        `pay_${orderNumber}`
      );

      res.status(201).json({
        ok: true,
        ...result,
      });
    } catch (e) {
      console.error('checkout.purchase', e);
      res.status(500).json({ error: 'Could not complete purchase.' });
    }
  });

  router.post('/razorpay/order', async (req, res) => {
    try {
      if (!razorpayConfigured()) {
        res.status(501).json({ error: 'Online payments are not configured on this server.' });
        return;
      }

      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const body = (req.body ?? {}) as CheckoutBody;
      const prepResult = await prepareCheckoutPurchase(sql, user, body);
      if (!prepResult.ok) {
        res.status(prepResult.status).json({ error: prepResult.error });
        return;
      }

      const { item, total } = prepResult.prep;
      if (item.currency !== 'INR') {
        res.status(400).json({
          error: 'Razorpay is only enabled for INR catalog pricing. Use demo checkout or update product currency.',
        });
        return;
      }

      const amountPaise = Math.round(total * 100);
      if (amountPaise < 100) {
        res.status(400).json({ error: 'Order total is too small for Razorpay.' });
        return;
      }

      const receipt = createOrderNumber().replace(/[^A-Za-z0-9_]/g, '').slice(0, 40);
      const rzRes = await razorpayFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: {
            product: item.slug,
            userId: user.id,
          },
        }),
      });

      const data = (await rzRes.json()) as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
      if (!rzRes.ok || !data.id) {
        console.error('razorpay.order', data);
        res.status(502).json({ error: data.error?.description ?? 'Could not create payment order.' });
        return;
      }

      res.json({
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: data.id,
        amount: data.amount ?? amountPaise,
        currency: data.currency ?? 'INR',
      });
    } catch (e) {
      console.error('checkout.razorpay.order', e);
      res.status(500).json({ error: 'Could not start payment.' });
    }
  });

  type RazorpayVerifyBody = CheckoutBody & {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  router.post('/razorpay/verify', async (req, res) => {
    try {
      if (!razorpayConfigured()) {
        res.status(501).json({ error: 'Online payments are not configured on this server.' });
        return;
      }

      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const body = (req.body ?? {}) as RazorpayVerifyBody;
      const orderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id.trim() : '';
      const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
      const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature.trim() : '';
      if (!orderId || !paymentId || !signature) {
        res.status(400).json({ error: 'Payment verification details are missing.' });
        return;
      }

      const secret = process.env.RAZORPAY_KEY_SECRET!;
      if (!verifyRazorpaySignature(orderId, paymentId, signature, secret)) {
        res.status(400).json({ error: 'Invalid payment signature.' });
        return;
      }

      const payRes = await razorpayFetch(`/payments/${encodeURIComponent(paymentId)}`);
      const payData = (await payRes.json()) as {
        status?: string;
        order_id?: string;
        error?: { description?: string };
      };
      if (!payRes.ok) {
        res.status(502).json({ error: payData.error?.description ?? 'Could not verify payment.' });
        return;
      }
      if (payData.order_id && payData.order_id !== orderId) {
        res.status(400).json({ error: 'Payment does not match this order.' });
        return;
      }
      if (payData.status !== 'authorized' && payData.status !== 'captured') {
        res.status(400).json({ error: 'Payment is not completed.' });
        return;
      }

      const ordRes = await razorpayFetch(`/orders/${encodeURIComponent(orderId)}`);
      const ordData = (await ordRes.json()) as { amount?: number; currency?: string; notes?: { product?: string } };
      if (!ordRes.ok || ordData.currency !== 'INR') {
        res.status(502).json({ error: 'Could not verify Razorpay order.' });
        return;
      }

      const prepResult = await prepareCheckoutPurchase(sql, user, body);
      if (!prepResult.ok) {
        res.status(prepResult.status).json({ error: prepResult.error });
        return;
      }

      const { item, total } = prepResult.prep;
      const expectedPaise = Math.round(total * 100);
      if (ordData.amount !== expectedPaise) {
        res.status(400).json({ error: 'Order amount mismatch. Please refresh and try again.' });
        return;
      }

      const orderNumber = createOrderNumber();
      const result = await commitCheckoutPurchase(
        sql,
        user,
        body,
        prepResult.prep,
        orderNumber,
        'razorpay',
        paymentId
      );

      res.status(201).json({
        ok: true,
        ...result,
      });
    } catch (e) {
      console.error('checkout.razorpay.verify', e);
      res.status(500).json({ error: 'Could not complete payment.' });
    }
  });

  return router;
}
