import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { mapCatalogItem, type CatalogItemRow } from '../platform.js';
import { requireAdminPermission } from '../auth/session.js';
import { buildDtdcTrackingUrl, lookupDeliveryAvailability } from '../shipping.js';

type BookMetadata = {
  isbn: string | null;
  galleryImages: string[];
  shippingNotes: string | null;
};

type AdminBookRow = CatalogItemRow & {
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

type AdminBookInput = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  authorName: string;
  category: string;
  stockQuantity: number;
  status: 'draft' | 'published';
  tags: string[];
  isbn: string | null;
  shippingNotes: string | null;
  galleryImages: string[];
};

type ShipmentRow = {
  shipment_id: string;
  order_id: string;
  order_number: string;
  item_id: string;
  item_slug: string;
  item_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: string | number;
  quantity: number;
  shipment_status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  consignment_number: string | null;
  carrier: string;
  tracking_url: string | null;
  full_name: string;
  email: string;
  phone: string;
  address_line: string;
  city: string | null;
  state: string | null;
  pin_code: string;
  delivery_available: boolean;
  admin_notes: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parsePositiveMoney(value: unknown): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(num) || num < 0) return null;
  return Number(num.toFixed(2));
}

function parseNonNegativeInt(value: unknown): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num) || num < 0) return null;
  return num;
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 10);
}

function parseGalleryImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 8);
}

function parseBookMetadata(metadata: Record<string, unknown> | null): BookMetadata {
  const meta = metadata ?? {};
  return {
    isbn: typeof meta.isbn === 'string' ? meta.isbn : null,
    shippingNotes: typeof meta.shippingNotes === 'string' ? meta.shippingNotes : null,
    galleryImages: parseGalleryImages(meta.galleryImages),
  };
}

function toAdminBook(row: AdminBookRow) {
  const metadata = parseBookMetadata(row.metadata);
  return {
    ...mapCatalogItem(row),
    id: row.id,
    productId: row.id,
    status: row.status,
    author: row.author_name ?? undefined,
    stock: row.stock_quantity ?? 0,
    isbn: metadata.isbn,
    shippingNotes: metadata.shippingNotes,
    galleryImages: metadata.galleryImages.length > 0 ? metadata.galleryImages : [row.image_url],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapShipment(row: ShipmentRow) {
  return {
    id: row.shipment_id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    itemId: row.item_id,
    itemSlug: row.item_slug,
    itemTitle: row.item_title,
    quantity: row.quantity,
    totalAmount: typeof row.total_amount === 'number' ? row.total_amount : Number(row.total_amount),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shipmentStatus: row.shipment_status,
    consignmentNumber: row.consignment_number,
    carrier: row.carrier,
    trackingUrl:
      row.tracking_url ?? (row.consignment_number ? buildDtdcTrackingUrl(row.consignment_number) : null),
    shippingAddress: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      addressLine: row.address_line,
      city: row.city,
      state: row.state,
      pinCode: row.pin_code,
    },
    deliveryAvailable: row.delivery_available,
    adminNotes: row.admin_notes,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseBookInput(body: Record<string, unknown>): { data?: AdminBookInput; error?: string } {
  const title = parseOptionalString(body.title);
  if (!title) return { error: 'Title is required.' };
  const description = parseOptionalString(body.description);
  if (!description) return { error: 'Description is required.' };
  const imageUrl = parseOptionalString(body.imageUrl);
  if (!imageUrl) return { error: 'Cover image URL is required.' };
  const price = parsePositiveMoney(body.price);
  if (price === null) return { error: 'Price must be a valid non-negative number.' };
  const authorName = parseOptionalString(body.authorName);
  if (!authorName) return { error: 'Author name is required.' };
  const category = parseOptionalString(body.category);
  if (!category) return { error: 'Category is required.' };
  const stockQuantity = parseNonNegativeInt(body.stockQuantity);
  if (stockQuantity === null) return { error: 'Stock quantity must be a non-negative integer.' };

  const slugSource = parseOptionalString(body.slug) ?? title;
  const slug = normalizeSlug(slugSource);
  if (!slug) return { error: 'Slug could not be generated.' };

  return {
    data: {
      slug,
      title,
      description,
      imageUrl,
      price,
      authorName,
      category,
      stockQuantity,
      status: body.status === 'draft' ? 'draft' : 'published',
      tags: parseTags(body.tags),
      isbn: parseOptionalString(body.isbn),
      shippingNotes: parseOptionalString(body.shippingNotes),
      galleryImages: parseGalleryImages(body.galleryImages),
    },
  };
}

async function listBooks(sql: NeonQueryFunction<false, false>): Promise<AdminBookRow[]> {
  return (await sql`
    SELECT *
    FROM catalog_items
    WHERE type = 'physical_book'
    ORDER BY created_at DESC
  `) as AdminBookRow[];
}

async function getBookById(sql: NeonQueryFunction<false, false>, id: string): Promise<AdminBookRow | null> {
  const rows = (await sql`
    SELECT *
    FROM catalog_items
    WHERE id = ${id}
      AND type = 'physical_book'
    LIMIT 1
  `) as AdminBookRow[];
  return rows[0] ?? null;
}

async function listShipments(sql: NeonQueryFunction<false, false>): Promise<ShipmentRow[]> {
  return (await sql`
    SELECT
      bs.id AS shipment_id,
      bs.order_id,
      o.order_number,
      bs.item_id,
      oi.item_slug,
      oi.item_title,
      o.billing_name AS customer_name,
      o.billing_email AS customer_email,
      o.billing_phone AS customer_phone,
      o.total_amount,
      oi.quantity,
      bs.shipment_status,
      bs.consignment_number,
      bs.carrier,
      bs.tracking_url,
      bs.full_name,
      bs.email,
      bs.phone,
      bs.address_line,
      bs.city,
      bs.state,
      bs.pin_code,
      bs.delivery_available,
      bs.admin_notes,
      bs.shipped_at,
      bs.delivered_at,
      bs.created_at,
      bs.updated_at
    FROM book_shipments bs
    JOIN orders o ON o.id = bs.order_id
    JOIN order_items oi ON oi.order_id = o.id
    ORDER BY bs.created_at DESC
  `) as ShipmentRow[];
}

function toCsv(rows: ReturnType<typeof mapShipment>[]): string {
  const headers = [
    'Order Number',
    'Book',
    'Quantity',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Address',
    'City',
    'State',
    'PIN Code',
    'Carrier',
    'Shipment Status',
    'Consignment Number',
    'Tracking URL',
    'Ordered At',
  ];

  const escape = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [
      row.orderNumber,
      row.itemTitle,
      row.quantity,
      row.customerName,
      row.customerEmail,
      row.customerPhone,
      row.shippingAddress.addressLine,
      row.shippingAddress.city,
      row.shippingAddress.state,
      row.shippingAddress.pinCode,
      row.carrier,
      row.shipmentStatus,
      row.consignmentNumber,
      row.trackingUrl,
      row.createdAt,
    ]
      .map(escape)
      .join(',')
  );

  return [headers.join(','), ...lines].join('\n');
}

export function createAdminBooksRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/books', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'books');
      if (!user) return;
      const items = await listBooks(sql);
      res.json({ items: items.map(toAdminBook) });
    } catch (e) {
      console.error('admin.books:list', e);
      res.status(500).json({ error: 'Could not load books.' });
    }
  });

  router.get('/books/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'books');
      if (!user) return;
      const item = await getBookById(sql, req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Book not found.' });
        return;
      }
      res.json({ item: toAdminBook(item) });
    } catch (e) {
      console.error('admin.books:detail', e);
      res.status(500).json({ error: 'Could not load book.' });
    }
  });

  router.post('/books', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'books');
      if (!user) return;
      const parsed = parseBookInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid book input.' });
        return;
      }
      const input = parsed.data;
      const metadata = {
        isbn: input.isbn,
        shippingNotes: input.shippingNotes,
        galleryImages: input.galleryImages.length > 0 ? input.galleryImages : [input.imageUrl],
      };

      const rows = await sql`
        INSERT INTO catalog_items (
          slug,
          type,
          title,
          description,
          image_url,
          price,
          status,
          featured,
          author_name,
          category,
          stock_quantity,
          tags,
          metadata
        )
        VALUES (
          ${input.slug},
          'physical_book',
          ${input.title},
          ${input.description},
          ${input.imageUrl},
          ${input.price},
          ${input.status},
          FALSE,
          ${input.authorName},
          ${input.category},
          ${input.stockQuantity},
          ${input.tags},
          ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING id
      `;

      const item = await getBookById(sql, (rows[0] as { id: string }).id);
      res.status(201).json({ item: item ? toAdminBook(item) : null });
    } catch (e) {
      console.error('admin.books:create', e);
      res.status(500).json({ error: 'Could not create book.' });
    }
  });

  router.patch('/books/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'books');
      if (!user) return;
      const existing = await getBookById(sql, req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Book not found.' });
        return;
      }
      const parsed = parseBookInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid book input.' });
        return;
      }
      const input = parsed.data;
      const metadata = {
        isbn: input.isbn,
        shippingNotes: input.shippingNotes,
        galleryImages: input.galleryImages.length > 0 ? input.galleryImages : [input.imageUrl],
      };

      await sql`
        UPDATE catalog_items
        SET
          slug = ${input.slug},
          title = ${input.title},
          description = ${input.description},
          image_url = ${input.imageUrl},
          price = ${input.price},
          status = ${input.status},
          author_name = ${input.authorName},
          category = ${input.category},
          stock_quantity = ${input.stockQuantity},
          tags = ${input.tags},
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      const item = await getBookById(sql, existing.id);
      res.json({ item: item ? toAdminBook(item) : null });
    } catch (e) {
      console.error('admin.books:update', e);
      res.status(500).json({ error: 'Could not update book.' });
    }
  });

  router.get('/orders/shipments', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'orders');
      if (!user) return;
      const rows = await listShipments(sql);
      res.json({ items: rows.map(mapShipment) });
    } catch (e) {
      console.error('admin.shipments:list', e);
      res.status(500).json({ error: 'Could not load shipments.' });
    }
  });

  router.get('/orders/shipments/export', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'orders');
      if (!user) return;
      const rows = (await listShipments(sql)).map(mapShipment);
      const csv = toCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.send(csv);
    } catch (e) {
      console.error('admin.shipments:export', e);
      res.status(500).json({ error: 'Could not export shipping list.' });
    }
  });

  router.patch('/orders/shipments/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'orders');
      if (!user) return;

      const rows = (await sql`
        SELECT id, order_id, shipment_status, carrier
        FROM book_shipments
        WHERE id = ${req.params.id}
        LIMIT 1
      `) as Array<{ id: string; order_id: string; shipment_status: ShipmentRow['shipment_status']; carrier: string }>;

      const shipment = rows[0] ?? null;
      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found.' });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const status =
        body.shipmentStatus === 'processing' ||
        body.shipmentStatus === 'shipped' ||
        body.shipmentStatus === 'delivered' ||
        body.shipmentStatus === 'cancelled'
          ? body.shipmentStatus
          : shipment.shipment_status;
      const consignmentNumber = parseOptionalString(body.consignmentNumber);
      const adminNotes = parseOptionalString(body.adminNotes);
      const trackingUrl = parseOptionalString(body.trackingUrl) ?? (consignmentNumber ? buildDtdcTrackingUrl(consignmentNumber) : null);

      await sql`
        UPDATE book_shipments
        SET
          shipment_status = ${status},
          consignment_number = ${consignmentNumber},
          tracking_url = ${trackingUrl},
          admin_notes = ${adminNotes},
          shipped_at = CASE
            WHEN ${status} = 'shipped' AND shipped_at IS NULL THEN NOW()
            WHEN ${status} = 'processing' THEN NULL
            ELSE shipped_at
          END,
          delivered_at = CASE
            WHEN ${status} = 'delivered' THEN NOW()
            WHEN ${status} != 'delivered' THEN NULL
            ELSE delivered_at
          END,
          updated_at = NOW()
        WHERE id = ${shipment.id}
      `;

      await sql`
        UPDATE orders
        SET status = ${
          status === 'delivered'
            ? 'delivered'
            : status === 'shipped'
              ? 'shipping'
              : status === 'cancelled'
                ? 'cancelled'
                : 'pending'
        }
        WHERE id = ${shipment.order_id}
      `;

      const updated = (await listShipments(sql)).find((entry) => entry.shipment_id === shipment.id);
      res.json({ item: updated ? mapShipment(updated) : null });
    } catch (e) {
      console.error('admin.shipments:update', e);
      res.status(500).json({ error: 'Could not update shipment.' });
    }
  });

  return router;
}

export function createCatalogBooksRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/delivery-check', async (req, res) => {
    try {
      const pinCode = typeof req.query.pinCode === 'string' ? req.query.pinCode : '';
      const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
      if (!pinCode.trim()) {
        res.status(400).json({ error: 'PIN code is required.' });
        return;
      }
      if (slug) {
        const rows = (await sql`
          SELECT id
          FROM catalog_items
          WHERE slug = ${slug}
            AND type = 'physical_book'
            AND status = 'published'
          LIMIT 1
        `) as Array<{ id: string }>;
        if (rows.length === 0) {
          res.status(404).json({ error: 'Physical book not found.' });
          return;
        }
      }
      const delivery = await lookupDeliveryAvailability(sql, pinCode);
      res.json(delivery);
    } catch (e) {
      console.error('catalog.delivery-check', e);
      res.status(500).json({ error: 'Could not validate delivery availability.' });
    }
  });

  return router;
}
