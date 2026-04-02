import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { requireSessionUser } from '../auth/session.js';
import { buildDtdcTrackingUrl } from '../shipping.js';

type CountRow = {
  courses: number;
  ebooks: number;
  live_classes: number;
  exams: number;
};

type AccessRow = {
  slug: string;
  title: string;
  type: string;
  image_url: string;
  progress_percent: number;
  duration_label: string | null;
  access_expires_at: string | null;
  scheduled_at: string | null;
};

type ShipmentRow = {
  item_title: string;
  item_slug: string;
  item_type: string;
  order_number: string;
  total_amount: string | number;
  shipment_status: string | null;
  consignment_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  delivered_at: string | null;
  created_at: string;
};

type LibraryRow = {
  slug: string;
  title: string;
  type: string;
  image_url: string;
  price: string | number;
  file_format: string | null;
  pages: number | null;
  preview_enabled: boolean;
  download_enabled: boolean;
  question_count: number | null;
  attempts_allowed: number | null;
  remaining_attempts: number | null;
  passing_score: number | null;
  duration_label: string | null;
  progress_percent: number;
  access_expires_at: string | null;
  scheduled_at: string | null;
  meeting_url: string | null;
  metadata: Record<string, unknown> | null;
};

type AccessDetailRow = {
  slug: string;
  title: string;
  type: string;
  access_expires_at: string | null;
  progress_percent: number;
  remaining_attempts: number | null;
};

type ShipmentSummaryRow = {
  item_title: string;
  shipment_status: string;
  consignment_number: string | null;
  created_at: string;
};

function mapLibraryItem(row: LibraryRow) {
  const scheduledAt = row.scheduled_at ? new Date(row.scheduled_at) : null;
  return {
    slug: row.slug,
    title: row.title,
    type: row.type,
    image: row.image_url,
    price: typeof row.price === 'number' ? row.price : Number(row.price),
    format: row.file_format ?? undefined,
    pages: row.pages ?? undefined,
    previewAvailable: row.preview_enabled,
    downloadAllowed: row.download_enabled,
    questions: row.question_count ?? undefined,
    attemptsAllowed: row.attempts_allowed ?? undefined,
    remainingAttempts: row.remaining_attempts ?? undefined,
    passingScore: row.passing_score ?? undefined,
    duration: row.duration_label ?? '',
    progress: row.progress_percent,
    accessExpiresAt: row.access_expires_at,
    accessLabel:
      row.access_expires_at === null
        ? 'Lifetime access'
        : `Access until ${new Date(row.access_expires_at).toLocaleDateString('en-US')}`,
    scheduledAt: row.scheduled_at,
    date: scheduledAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '',
    time: scheduledAt?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? '',
    meetingUrl: row.meeting_url ?? undefined,
    metadata: row.metadata ?? {},
  };
}

export function createLearnerRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/overview', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const [countsRows, accessRows, liveRows, shipmentRows] = await Promise.all([
        sql`
          SELECT
            COUNT(*) FILTER (WHERE c.type = 'course' AND ue.status = 'active')::int AS courses,
            COUNT(*) FILTER (WHERE c.type = 'ebook' AND ue.status = 'active')::int AS ebooks,
            COUNT(*) FILTER (WHERE c.type = 'live_class' AND ue.status = 'active')::int AS live_classes,
            COUNT(*) FILTER (WHERE c.type = 'practice_exam' AND ue.status = 'active')::int AS exams
          FROM user_entitlements ue
          JOIN catalog_items c ON c.id = ue.item_id
          WHERE ue.user_id = ${user.id}
        `,
        sql`
          SELECT
            c.slug,
            c.title,
            c.type,
            c.image_url,
            ue.progress_percent,
            c.duration_label,
            ue.access_expires_at,
            c.scheduled_at
          FROM user_entitlements ue
          JOIN catalog_items c ON c.id = ue.item_id
          WHERE ue.user_id = ${user.id}
            AND ue.status = 'active'
          ORDER BY ue.purchased_at DESC
          LIMIT 5
        `,
        sql`
          SELECT
            c.slug,
            c.title,
            c.type,
            c.image_url,
            ue.progress_percent,
            c.duration_label,
            ue.access_expires_at,
            c.scheduled_at
          FROM user_entitlements ue
          JOIN catalog_items c ON c.id = ue.item_id
          WHERE ue.user_id = ${user.id}
            AND c.type = 'live_class'
            AND ue.status = 'active'
            AND c.scheduled_at IS NOT NULL
          ORDER BY c.scheduled_at ASC
          LIMIT 3
        `,
        sql`
          SELECT
            oi.item_title,
            bs.shipment_status,
            bs.consignment_number,
            o.created_at
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          JOIN book_shipments bs ON bs.order_id = o.id
          WHERE o.user_id = ${user.id}
          ORDER BY o.created_at DESC
          LIMIT 5
        `,
      ]);

      const counts = (countsRows[0] ?? {
        courses: 0,
        ebooks: 0,
        live_classes: 0,
        exams: 0,
      }) as CountRow;

      const recentAccess = (accessRows as AccessRow[]).map((row) => ({
        slug: row.slug,
        title: row.title,
        type: row.type,
        image: row.image_url,
        progress: row.progress_percent,
        duration: row.duration_label ?? '',
        expires:
          row.access_expires_at === null
            ? 'Lifetime access'
            : `Access until ${new Date(row.access_expires_at).toLocaleDateString('en-US')}`,
      }));

      const upcomingLiveClasses = (liveRows as AccessRow[]).map((row) => {
        const when = row.scheduled_at ? new Date(row.scheduled_at) : null;
        const diffHours = when ? Math.max(0, Math.floor((when.getTime() - Date.now()) / 36e5)) : 0;
        const days = Math.floor(diffHours / 24);
        const hours = diffHours % 24;
        return {
          slug: row.slug,
          title: row.title,
          date: when?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '',
          time: when?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? '',
          countdown: days > 0 ? `Starts in ${days} day${days === 1 ? '' : 's'}` : `Starts in ${hours} hours`,
        };
      });

      const pendingOrders = (shipmentRows as ShipmentSummaryRow[]).map((row) => ({
        title: row.item_title,
        status: row.shipment_status,
        consignmentNumber: row.consignment_number,
        orderedAt: new Date(row.created_at).toLocaleDateString('en-US'),
      }));

      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        counts,
        recentAccess,
        upcomingLiveClasses,
        pendingOrders,
      });
    } catch (e) {
      console.error('learner.overview', e);
      res.status(500).json({ error: 'Could not load dashboard overview.' });
    }
  });

  router.get('/library', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
      const rows = (await sql`
        SELECT
          c.slug,
          c.title,
          c.type,
          c.image_url,
          c.price,
          c.file_format,
          c.pages,
          c.preview_enabled,
          c.download_enabled,
          c.question_count,
          c.attempts_allowed,
          ue.remaining_attempts,
          c.passing_score,
          c.duration_label,
          ue.progress_percent,
          ue.access_expires_at,
          c.scheduled_at,
          c.meeting_url,
          c.metadata
        FROM user_entitlements ue
        JOIN catalog_items c ON c.id = ue.item_id
        WHERE ue.user_id = ${user.id}
          AND ue.status = 'active'
          AND (${type || null}::text IS NULL OR c.type = ${type || null})
          AND (ue.access_expires_at IS NULL OR ue.access_expires_at > NOW())
        ORDER BY ue.purchased_at DESC
      `) as LibraryRow[];

      res.json({ items: rows.map(mapLibraryItem) });
    } catch (e) {
      console.error('learner.library', e);
      res.status(500).json({ error: 'Could not load learner library.' });
    }
  });

  router.get('/orders', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const rows = (await sql`
        SELECT
          oi.item_title,
          oi.item_slug,
          oi.item_type,
          o.order_number,
          o.total_amount,
          COALESCE(bs.shipment_status, o.status) AS shipment_status,
          bs.consignment_number,
          bs.carrier,
          bs.tracking_url,
          bs.address_line,
          bs.city,
          bs.state,
          bs.pin_code,
          bs.delivered_at,
          o.created_at
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN book_shipments bs ON bs.order_id = o.id
        WHERE o.user_id = ${user.id}
        ORDER BY o.created_at DESC
      `) as ShipmentRow[];

      res.json({
        orders: rows.map((row) => ({
          itemTitle: row.item_title,
          itemSlug: row.item_slug,
          itemType: row.item_type,
          orderNumber: row.order_number,
          totalAmount: typeof row.total_amount === 'number' ? row.total_amount : Number(row.total_amount),
          status: row.shipment_status ?? 'paid',
          consignmentNumber: row.consignment_number,
          carrier: row.carrier,
          trackingUrl: row.tracking_url ?? (row.consignment_number ? buildDtdcTrackingUrl(row.consignment_number) : null),
          addressLine: row.address_line,
          city: row.city,
          state: row.state,
          pinCode: row.pin_code,
          deliveredAt: row.delivered_at,
          createdAt: row.created_at,
        })),
      });
    } catch (e) {
      console.error('learner.orders', e);
      res.status(500).json({ error: 'Could not load learner orders.' });
    }
  });

  router.get('/access/:slug', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const rows = (await sql`
        SELECT
          c.slug,
          c.title,
          c.type,
          ue.access_expires_at,
          ue.progress_percent,
          ue.remaining_attempts
        FROM user_entitlements ue
        JOIN catalog_items c ON c.id = ue.item_id
        WHERE ue.user_id = ${user.id}
          AND c.slug = ${req.params.slug}
          AND ue.status = 'active'
          AND (ue.access_expires_at IS NULL OR ue.access_expires_at > NOW())
        LIMIT 1
      `) as AccessDetailRow[];

      const access = rows[0] ?? null;
      res.json({
        hasAccess: Boolean(access),
        access: access
          ? {
              slug: access.slug,
              title: access.title,
              type: access.type,
              accessExpiresAt: access.access_expires_at,
              progressPercent: access.progress_percent,
              remainingAttempts: access.remaining_attempts,
            }
          : null,
      });
    } catch (e) {
      console.error('learner.access', e);
      res.status(500).json({ error: 'Could not load access details.' });
    }
  });

  return router;
}
