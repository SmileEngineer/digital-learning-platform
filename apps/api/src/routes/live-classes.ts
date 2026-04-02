import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { notifyUser } from '../notifications.js';
import { mapCatalogItem, type CatalogItemRow } from '../platform.js';
import { requireAdminUser, requireSessionUser } from '../auth/session.js';

type LiveClassStatus = 'scheduled' | 'rescheduled' | 'cancelled' | 'completed';

type LiveClassRow = CatalogItemRow & {
  meeting_url: string | null;
  spots_total: number | null;
  enrolled_count: number;
  refunded_count: number;
};

type LiveClassRecipientRow = {
  user_id: string;
  email: string;
  order_id: string | null;
};

type LiveClassInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructorName: string;
  category: string;
  durationLabel: string;
  durationMinutes: number;
  scheduledAt: string;
  spotsTotal: number | null;
  meetingUrl: string;
  meetingProvider: string;
  status: LiveClassStatus;
  joinWindowMinutes: number;
  registeredEmailRequired: boolean;
  tags: string[];
  agenda: Array<{ title: string; duration?: string }>;
  cancellationReason: string | null;
};

type LiveClassMetadata = {
  liveClassStatus: LiveClassStatus;
  meetingProvider: string;
  joinWindowMinutes: number;
  registeredEmailRequired: boolean;
  cancellationReason?: string | null;
  refundInitiatedAt?: string | null;
  lastRescheduledAt?: string | null;
};

const LIVE_CLASS_STATUSES: LiveClassStatus[] = ['scheduled', 'rescheduled', 'cancelled', 'completed'];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseMetadata(value: Record<string, unknown> | null): LiveClassMetadata {
  const metadata = value ?? {};
  const liveClassStatus =
    typeof metadata.liveClassStatus === 'string' && LIVE_CLASS_STATUSES.includes(metadata.liveClassStatus as LiveClassStatus)
      ? (metadata.liveClassStatus as LiveClassStatus)
      : 'scheduled';

  return {
    liveClassStatus,
    meetingProvider: typeof metadata.meetingProvider === 'string' ? metadata.meetingProvider : 'google_meet',
    joinWindowMinutes:
      typeof metadata.joinWindowMinutes === 'number' && metadata.joinWindowMinutes > 0
        ? metadata.joinWindowMinutes
        : 30,
    registeredEmailRequired: metadata.registeredEmailRequired !== false,
    cancellationReason:
      typeof metadata.cancellationReason === 'string' && metadata.cancellationReason.trim()
        ? metadata.cancellationReason
        : null,
    refundInitiatedAt: typeof metadata.refundInitiatedAt === 'string' ? metadata.refundInitiatedAt : null,
    lastRescheduledAt: typeof metadata.lastRescheduledAt === 'string' ? metadata.lastRescheduledAt : null,
  };
}

function formatDateTime(iso: string): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return `${value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} at ${value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function normalizeSpotsRemaining(spotsTotal: number | null, enrolledCount: number): number | null {
  if (spotsTotal === null) return null;
  return Math.max(spotsTotal - enrolledCount, 0);
}

function getLiveClassStatus(row: LiveClassRow): LiveClassStatus {
  return parseMetadata(row.metadata).liveClassStatus;
}

function toAdminLiveClass(row: LiveClassRow) {
  const metadata = parseMetadata(row.metadata);
  return {
    ...mapCatalogItem(row),
    meetingUrl: row.meeting_url ?? undefined,
    meetingProvider: metadata.meetingProvider,
    liveClassStatus: metadata.liveClassStatus,
    joinWindowMinutes: metadata.joinWindowMinutes,
    registeredEmailRequired: metadata.registeredEmailRequired,
    cancellationReason: metadata.cancellationReason ?? undefined,
    refundInitiatedAt: metadata.refundInitiatedAt ?? undefined,
    lastRescheduledAt: metadata.lastRescheduledAt ?? undefined,
    spotsTotal: row.spots_total ?? undefined,
    enrolledCount: row.enrolled_count,
    refundedCount: row.refunded_count,
  };
}

function parseAgenda(value: unknown): Array<{ title: string; duration?: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const item = entry as Record<string, unknown>;
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      const duration = typeof item.duration === 'string' ? item.duration.trim() : '';
      if (!title) return null;
      return duration ? { title, duration } : { title };
    })
    .filter((entry): entry is { title: string; duration?: string } => Boolean(entry));
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 10);
}

function parseLiveClassInput(body: Record<string, unknown>): { data?: LiveClassInput; error?: string } {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const instructorName = typeof body.instructorName === 'string' ? body.instructorName.trim() : '';
  const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'Live Classes';
  const durationLabel = typeof body.durationLabel === 'string' ? body.durationLabel.trim() : '';
  const meetingUrl = typeof body.meetingUrl === 'string' ? body.meetingUrl.trim() : '';
  const meetingProvider =
    typeof body.meetingProvider === 'string' && body.meetingProvider.trim()
      ? body.meetingProvider.trim()
      : 'google_meet';
  const scheduledAt = typeof body.scheduledAt === 'string' ? body.scheduledAt.trim() : '';
  const slugRaw = typeof body.slug === 'string' ? body.slug.trim() : '';
  const slug = slugRaw || slugify(title);
  const price = Number(body.price);
  const durationMinutes = Number(body.durationMinutes);
  const joinWindowMinutes = Number(body.joinWindowMinutes);
  const spotsRaw = body.spotsTotal;
  const spotsTotal =
    spotsRaw === null || spotsRaw === undefined || spotsRaw === ''
      ? null
      : Number.isFinite(Number(spotsRaw))
        ? Number(spotsRaw)
        : NaN;
  const statusCandidate = typeof body.status === 'string' ? body.status : 'scheduled';
  const status = LIVE_CLASS_STATUSES.includes(statusCandidate as LiveClassStatus)
    ? (statusCandidate as LiveClassStatus)
    : 'scheduled';
  const registeredEmailRequired = body.registeredEmailRequired !== false;
  const cancellationReason =
    typeof body.cancellationReason === 'string' && body.cancellationReason.trim()
      ? body.cancellationReason.trim()
      : null;
  const tags = parseTags(body.tags);
  const agenda = parseAgenda(body.agenda);

  if (!title) return { error: 'Title is required.' };
  if (!slug) return { error: 'Slug is required.' };
  if (!description) return { error: 'Description is required.' };
  if (!imageUrl) return { error: 'Image URL is required.' };
  if (!instructorName) return { error: 'Instructor name is required.' };
  if (!durationLabel) return { error: 'Duration label is required.' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a valid non-negative number.' };
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { error: 'Duration minutes must be greater than zero.' };
  }
  if (!meetingUrl) return { error: 'Google Meet URL is required.' };
  if (!scheduledAt || Number.isNaN(new Date(scheduledAt).getTime())) {
    return { error: 'A valid scheduled date and time is required.' };
  }
  if (!Number.isFinite(joinWindowMinutes) || joinWindowMinutes <= 0 || joinWindowMinutes > 240) {
    return { error: 'Join window must be between 1 and 240 minutes.' };
  }
  if (spotsTotal !== null && (!Number.isFinite(spotsTotal) || spotsTotal < 1)) {
    return { error: 'Total spots must be empty or at least 1.' };
  }
  if (status === 'cancelled' && !cancellationReason) {
    return { error: 'Provide a cancellation reason when cancelling a class.' };
  }

  return {
    data: {
      slug,
      title,
      description,
      imageUrl,
      price,
      instructorName,
      category,
      durationLabel,
      durationMinutes,
      scheduledAt,
      spotsTotal,
      meetingUrl,
      meetingProvider,
      status,
      joinWindowMinutes,
      registeredEmailRequired,
      tags,
      agenda,
      cancellationReason,
    },
  };
}

async function getLiveClassById(
  sql: NeonQueryFunction<false, false>,
  id: string
): Promise<LiveClassRow | null> {
  const rows = (await sql`
    SELECT
      ci.*,
      COALESCE(active_entitlements.enrolled_count, 0)::int AS enrolled_count,
      COALESCE(refunded_orders.refunded_count, 0)::int AS refunded_count
    FROM catalog_items ci
    LEFT JOIN (
      SELECT item_id, COUNT(*)::int AS enrolled_count
      FROM user_entitlements
      WHERE status = 'active'
      GROUP BY item_id
    ) AS active_entitlements ON active_entitlements.item_id = ci.id
    LEFT JOIN (
      SELECT oi.item_id, COUNT(*)::int AS refunded_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.item_type = 'live_class'
        AND o.payment_status = 'refunded'
      GROUP BY oi.item_id
    ) AS refunded_orders ON refunded_orders.item_id = ci.id
    WHERE ci.id = ${id}
      AND ci.type = 'live_class'
    LIMIT 1
  `) as LiveClassRow[];
  return rows[0] ?? null;
}

async function getLiveClassBySlug(
  sql: NeonQueryFunction<false, false>,
  slug: string
): Promise<LiveClassRow | null> {
  const rows = (await sql`
    SELECT
      ci.*,
      COALESCE(active_entitlements.enrolled_count, 0)::int AS enrolled_count,
      COALESCE(refunded_orders.refunded_count, 0)::int AS refunded_count
    FROM catalog_items ci
    LEFT JOIN (
      SELECT item_id, COUNT(*)::int AS enrolled_count
      FROM user_entitlements
      WHERE status = 'active'
      GROUP BY item_id
    ) AS active_entitlements ON active_entitlements.item_id = ci.id
    LEFT JOIN (
      SELECT oi.item_id, COUNT(*)::int AS refunded_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.item_type = 'live_class'
        AND o.payment_status = 'refunded'
      GROUP BY oi.item_id
    ) AS refunded_orders ON refunded_orders.item_id = ci.id
    WHERE ci.slug = ${slug}
      AND ci.type = 'live_class'
    LIMIT 1
  `) as LiveClassRow[];
  return rows[0] ?? null;
}

async function listLiveClasses(sql: NeonQueryFunction<false, false>): Promise<LiveClassRow[]> {
  return (await sql`
    SELECT
      ci.*,
      COALESCE(active_entitlements.enrolled_count, 0)::int AS enrolled_count,
      COALESCE(refunded_orders.refunded_count, 0)::int AS refunded_count
    FROM catalog_items ci
    LEFT JOIN (
      SELECT item_id, COUNT(*)::int AS enrolled_count
      FROM user_entitlements
      WHERE status = 'active'
      GROUP BY item_id
    ) AS active_entitlements ON active_entitlements.item_id = ci.id
    LEFT JOIN (
      SELECT oi.item_id, COUNT(*)::int AS refunded_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.item_type = 'live_class'
        AND o.payment_status = 'refunded'
      GROUP BY oi.item_id
    ) AS refunded_orders ON refunded_orders.item_id = ci.id
    WHERE ci.type = 'live_class'
    ORDER BY ci.scheduled_at ASC NULLS LAST, ci.created_at DESC
  `) as LiveClassRow[];
}

async function getLiveClassRecipients(
  sql: NeonQueryFunction<false, false>,
  itemId: string
): Promise<LiveClassRecipientRow[]> {
  return (await sql`
    SELECT
      ue.user_id,
      u.email,
      ue.source_order_id AS order_id
    FROM user_entitlements ue
    JOIN users u ON u.id = ue.user_id
    WHERE ue.item_id = ${itemId}
      AND ue.status = 'active'
  `) as LiveClassRecipientRow[];
}

export function createAdminLiveClassesRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/live-classes', async (req, res) => {
    try {
      const user = await requireAdminUser(req, res, sql);
      if (!user) return;

      const rows = await listLiveClasses(sql);
      res.json({ items: rows.map(toAdminLiveClass) });
    } catch (e) {
      console.error('admin.live-classes:list', e);
      res.status(500).json({ error: 'Could not load live classes.' });
    }
  });

  router.post('/live-classes', async (req, res) => {
    try {
      const user = await requireAdminUser(req, res, sql);
      if (!user) return;

      const parsed = parseLiveClassInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid live class input.' });
        return;
      }

      const input = parsed.data;
      const metadata: LiveClassMetadata = {
        liveClassStatus: input.status,
        meetingProvider: input.meetingProvider,
        joinWindowMinutes: input.joinWindowMinutes,
        registeredEmailRequired: input.registeredEmailRequired,
        cancellationReason: input.cancellationReason,
        refundInitiatedAt: null,
        lastRescheduledAt: input.status === 'rescheduled' ? new Date().toISOString() : null,
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
          instructor_name,
          category,
          duration_label,
          duration_minutes,
          scheduled_at,
          meeting_url,
          spots_total,
          spots_remaining,
          tags,
          curriculum,
          metadata
        )
        VALUES (
          ${input.slug},
          'live_class',
          ${input.title},
          ${input.description},
          ${input.imageUrl},
          ${input.price},
          'published',
          FALSE,
          ${input.instructorName},
          ${input.category},
          ${input.durationLabel},
          ${input.durationMinutes},
          ${input.scheduledAt},
          ${input.meetingUrl},
          ${input.spotsTotal},
          ${input.spotsTotal},
          ${input.tags},
          ${JSON.stringify(input.agenda)}::jsonb,
          ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING id
      `;

      const created = await getLiveClassById(sql, (rows[0] as { id: string }).id);
      res.status(201).json({ item: created ? toAdminLiveClass(created) : null });
    } catch (e) {
      console.error('admin.live-classes:create', e);
      res.status(500).json({ error: 'Could not create live class.' });
    }
  });

  router.patch('/live-classes/:id', async (req, res) => {
    try {
      const user = await requireAdminUser(req, res, sql);
      if (!user) return;

      const current = await getLiveClassById(sql, req.params.id);
      if (!current) {
        res.status(404).json({ error: 'Live class not found.' });
        return;
      }

      const parsed = parseLiveClassInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid live class input.' });
        return;
      }

      const input = parsed.data;
      const previousMeta = parseMetadata(current.metadata);
      const scheduleChanged = new Date(current.scheduled_at ?? '').toISOString() !== new Date(input.scheduledAt).toISOString();
      const nextStatus: LiveClassStatus =
        input.status === 'cancelled'
          ? 'cancelled'
          : scheduleChanged
            ? 'rescheduled'
            : input.status;
      const metadata: LiveClassMetadata = {
        ...previousMeta,
        liveClassStatus: nextStatus,
        meetingProvider: input.meetingProvider,
        joinWindowMinutes: input.joinWindowMinutes,
        registeredEmailRequired: input.registeredEmailRequired,
        cancellationReason: nextStatus === 'cancelled' ? input.cancellationReason : null,
        refundInitiatedAt: previousMeta.refundInitiatedAt ?? null,
        lastRescheduledAt: scheduleChanged ? new Date().toISOString() : previousMeta.lastRescheduledAt ?? null,
      };

      const spotsRemaining = normalizeSpotsRemaining(input.spotsTotal, current.enrolled_count);

      await sql`
        UPDATE catalog_items
        SET
          slug = ${input.slug},
          title = ${input.title},
          description = ${input.description},
          image_url = ${input.imageUrl},
          price = ${input.price},
          instructor_name = ${input.instructorName},
          category = ${input.category},
          duration_label = ${input.durationLabel},
          duration_minutes = ${input.durationMinutes},
          scheduled_at = ${input.scheduledAt},
          meeting_url = ${input.meetingUrl},
          spots_total = ${input.spotsTotal},
          spots_remaining = ${spotsRemaining},
          tags = ${input.tags},
          curriculum = ${JSON.stringify(input.agenda)}::jsonb,
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${current.id}
      `;

      const updated = await getLiveClassById(sql, current.id);
      const recipients = current.enrolled_count > 0 ? await getLiveClassRecipients(sql, current.id) : [];

      if (updated && scheduleChanged) {
        for (const recipient of recipients) {
          await notifyUser(sql, {
            userId: recipient.user_id,
            email: recipient.email,
            kind: 'live_class_rescheduled',
            title: 'Live class rescheduled',
            message: `"${updated.title}" has been rescheduled to ${formatDateTime(input.scheduledAt)}.`,
            relatedItemId: updated.id,
            relatedOrderId: recipient.order_id,
            metadata: {
              slug: updated.slug,
              scheduledAt: input.scheduledAt,
              liveClassStatus: 'rescheduled',
            },
          });
        }
      }

      if (updated && nextStatus === 'cancelled' && getLiveClassStatus(current) !== 'cancelled') {
        for (const recipient of recipients) {
          await notifyUser(sql, {
            userId: recipient.user_id,
            email: recipient.email,
            kind: 'live_class_cancelled',
            title: 'Live class cancelled',
            message: `"${updated.title}" has been cancelled. Refunds can now be initiated from the admin panel.`,
            relatedItemId: updated.id,
            relatedOrderId: recipient.order_id,
            metadata: {
              slug: updated.slug,
              liveClassStatus: 'cancelled',
              cancellationReason: input.cancellationReason,
            },
          });
        }
      }

      res.json({
        item: updated ? toAdminLiveClass(updated) : null,
        notifiedUsers: recipients.length,
      });
    } catch (e) {
      console.error('admin.live-classes:update', e);
      res.status(500).json({ error: 'Could not update live class.' });
    }
  });

  router.post('/live-classes/:id/refund', async (req, res) => {
    try {
      const user = await requireAdminUser(req, res, sql);
      if (!user) return;

      const current = await getLiveClassById(sql, req.params.id);
      if (!current) {
        res.status(404).json({ error: 'Live class not found.' });
        return;
      }

      if (getLiveClassStatus(current) !== 'cancelled') {
        res.status(400).json({ error: 'Refunds can only be initiated after the class is cancelled.' });
        return;
      }

      const recipients = await getLiveClassRecipients(sql, current.id);
      if (recipients.length === 0) {
        res.json({ ok: true, refundedUsers: 0 });
        return;
      }

      const orderIds = recipients
        .map((recipient) => recipient.order_id)
        .filter((value): value is string => Boolean(value));

      if (orderIds.length > 0) {
        await sql`
          UPDATE orders
          SET
            status = 'refunded',
            payment_status = 'refunded',
            updated_at = NOW()
          WHERE id = ANY(${orderIds}::uuid[])
        `;
      }

      await sql`
        UPDATE user_entitlements
        SET
          status = 'cancelled',
          access_expires_at = NOW()
        WHERE item_id = ${current.id}
          AND status = 'active'
      `;

      const metadata = {
        ...parseMetadata(current.metadata),
        refundInitiatedAt: new Date().toISOString(),
      };

      await sql`
        UPDATE catalog_items
        SET
          spots_remaining = spots_total,
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${current.id}
      `;

      for (const recipient of recipients) {
        await notifyUser(sql, {
          userId: recipient.user_id,
          email: recipient.email,
          kind: 'live_class_refunded',
          title: 'Live class refund processed',
          message: `Your refund for "${current.title}" has been processed automatically after cancellation.`,
          relatedItemId: current.id,
          relatedOrderId: recipient.order_id,
          metadata: {
            slug: current.slug,
            liveClassStatus: 'cancelled',
            refundInitiatedAt: metadata.refundInitiatedAt,
          },
        });
      }

      const updated = await getLiveClassById(sql, current.id);
      res.json({
        ok: true,
        refundedUsers: recipients.length,
        item: updated ? toAdminLiveClass(updated) : null,
      });
    } catch (e) {
      console.error('admin.live-classes:refund', e);
      res.status(500).json({ error: 'Could not process live class refunds.' });
    }
  });

  return router;
}

export function createLearnerLiveClassesRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/notifications', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const rows = await sql`
        SELECT id, kind, title, message, status, metadata, created_at
        FROM notifications
        WHERE user_id = ${user.id}
          AND channel = 'in_app'
        ORDER BY created_at DESC
        LIMIT 100
      `;

      res.json({
        notifications: rows.map((row) => ({
          id: (row as { id: string }).id,
          kind: (row as { kind: string }).kind,
          title: (row as { title: string }).title,
          message: (row as { message: string }).message,
          status: (row as { status: string }).status,
          metadata: (row as { metadata: Record<string, unknown> | null }).metadata ?? {},
          createdAt: (row as { created_at: string }).created_at,
        })),
      });
    } catch (e) {
      console.error('learner.notifications', e);
      res.status(500).json({ error: 'Could not load notifications.' });
    }
  });

  router.post('/live-classes/:slug/join', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;

      const item = await getLiveClassBySlug(sql, req.params.slug);
      if (!item) {
        res.status(404).json({ error: 'Live class not found.' });
        return;
      }

      const metadata = parseMetadata(item.metadata);
      if (metadata.liveClassStatus === 'cancelled') {
        res.status(403).json({ error: 'This live class has been cancelled.' });
        return;
      }

      const accessRows = await sql`
        SELECT id
        FROM user_entitlements
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
          AND status = 'active'
          AND (access_expires_at IS NULL OR access_expires_at > NOW())
        LIMIT 1
      `;

      if (accessRows.length === 0) {
        res.status(403).json({ error: 'Only enrolled learners can join this live class.' });
        return;
      }

      if (!item.meeting_url) {
        res.status(400).json({ error: 'The meeting link has not been configured yet.' });
        return;
      }

      if (!item.scheduled_at) {
        res.status(400).json({ error: 'The live class schedule is not configured yet.' });
        return;
      }

      const scheduledAt = new Date(item.scheduled_at);
      const opensAt = new Date(scheduledAt.getTime() - metadata.joinWindowMinutes * 60_000);
      const closesAt = new Date(scheduledAt.getTime() + ((item.duration_minutes ?? 90) + 120) * 60_000);
      const now = new Date();

      if (now < opensAt) {
        res.status(403).json({
          error: `Joining opens ${metadata.joinWindowMinutes} minutes before the meeting.`,
          opensAt: opensAt.toISOString(),
        });
        return;
      }

      if (now > closesAt) {
        res.status(403).json({ error: 'This live class meeting window has ended.' });
        return;
      }

      res.json({
        ok: true,
        title: item.title,
        joinUrl: item.meeting_url,
        provider: metadata.meetingProvider,
        registeredEmail: metadata.registeredEmailRequired ? user.email : null,
        opensAt: opensAt.toISOString(),
        closesAt: closesAt.toISOString(),
      });
    } catch (e) {
      console.error('learner.live-classes.join', e);
      res.status(500).json({ error: 'Could not validate live class access.' });
    }
  });

  return router;
}
