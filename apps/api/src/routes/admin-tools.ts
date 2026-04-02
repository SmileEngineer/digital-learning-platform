import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { hashPassword } from '../auth/crypto.js';
import {
  ADMIN_PERMISSION_KEYS,
  type AdminPermission,
  getSessionUser,
  requireAdminPermission,
  requireAdminUser,
} from '../auth/session.js';
import { mapCatalogItem, type CatalogItemRow } from '../platform.js';

type CouponRow = {
  id: string;
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
  created_at: string;
};

type ArticleMetadata = {
  content: string;
  videoLinks: string[];
  publishedAt: string | null;
};

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  admin_permissions: string[];
  created_at: string;
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

function parsePositiveInt(value: unknown, min = 0): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num) || num < min) return null;
  return num;
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry : ''))
    .filter((entry): entry is AdminPermission => ADMIN_PERMISSION_KEYS.includes(entry as AdminPermission));
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

function parseArticleMetadata(metadata: Record<string, unknown> | null): ArticleMetadata {
  const meta = metadata ?? {};
  return {
    content: typeof meta.content === 'string' ? meta.content : '',
    videoLinks: parseStringArray(meta.videoLinks),
    publishedAt: typeof meta.publishedAt === 'string' ? meta.publishedAt : null,
  };
}

function parseCouponInput(body: Record<string, unknown>) {
  const code = parseOptionalString(body.code)?.toUpperCase();
  if (!code) return { error: 'Coupon code is required.' };
  const discountType =
    body.discountType === 'percent' || body.discountType === 'flat' || body.discountType === 'free'
      ? body.discountType
      : null;
  if (!discountType) return { error: 'Discount type is invalid.' };
  const amount = parsePositiveMoney(body.amount ?? 0);
  if (amount === null) return { error: 'Coupon amount must be a valid number.' };
  const usageLimit = body.usageLimit === null || body.usageLimit === ''
    ? null
    : parsePositiveInt(body.usageLimit, 1);
  if (body.usageLimit !== null && body.usageLimit !== '' && usageLimit === null) {
    return { error: 'Usage limit must be empty or at least 1.' };
  }
  return {
    data: {
      code,
      discountType,
      amount: discountType === 'free' ? 0 : amount,
      isActive: body.isActive !== false,
      validFrom: parseOptionalString(body.validFrom),
      validTo: parseOptionalString(body.validTo),
      usageLimit,
      applicableTypes: parseStringArray(body.applicableTypes),
      applicableSlugs: parseStringArray(body.applicableSlugs),
      applicableEmails: parseStringArray(body.applicableEmails).map((email) => email.toLowerCase()),
    },
  };
}

function parseArticleInput(body: Record<string, unknown>) {
  const title = parseOptionalString(body.title);
  if (!title) return { error: 'Title is required.' };
  const description = parseOptionalString(body.description);
  if (!description) return { error: 'Description is required.' };
  const imageUrl = parseOptionalString(body.imageUrl);
  if (!imageUrl) return { error: 'Cover image URL is required.' };
  const authorName = parseOptionalString(body.authorName);
  if (!authorName) return { error: 'Author name is required.' };
  const category = parseOptionalString(body.category);
  if (!category) return { error: 'Category is required.' };
  const content = parseOptionalString(body.content);
  if (!content) return { error: 'Article content is required.' };
  const slug = normalizeSlug(parseOptionalString(body.slug) ?? title);
  if (!slug) return { error: 'Slug could not be generated.' };
  return {
    data: {
      slug,
      title,
      description,
      imageUrl,
      authorName,
      category,
      status: body.status === 'draft' ? 'draft' : 'published',
      featured: body.featured === true,
      tags: parseStringArray(body.tags),
      content,
      videoLinks: parseStringArray(body.videoLinks),
      publishedAt: parseOptionalString(body.publishedAt) ?? new Date().toISOString(),
    },
  };
}

function parseAdminUserInput(body: Record<string, unknown>) {
  const email = parseOptionalString(body.email)?.toLowerCase();
  const name = parseOptionalString(body.name);
  const password = typeof body.password === 'string' ? body.password : '';
  const role =
    body.role === 'super_admin' ? 'super_admin' : body.role === 'admin' ? 'admin' : body.role === 'staff' ? 'staff' : null;
  if (!email) return { error: 'Email is required.' };
  if (!name) return { error: 'Name is required.' };
  if (!role) return { error: 'Role must be staff, admin, or super_admin.' };
  if (password.length > 0 && password.length < 8) return { error: 'Password must be at least 8 characters.' };
  return {
    data: {
      email,
      name,
      password,
      role,
      permissions: parsePermissions(body.permissions),
    },
  };
}

function mapCoupon(row: CouponRow) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    amount: typeof row.amount === 'number' ? row.amount : Number(row.amount),
    isActive: row.is_active,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    applicableTypes: row.applicable_types ?? [],
    applicableSlugs: row.applicable_slugs ?? [],
    applicableEmails: row.applicable_emails ?? [],
    createdAt: row.created_at,
  };
}

function mapArticle(row: CatalogItemRow) {
  const meta = parseArticleMetadata(row.metadata);
  return {
    ...mapCatalogItem(row),
    id: row.id,
    productId: row.id,
    status: row.status,
    author: row.author_name ?? undefined,
    featured: row.featured,
    content: meta.content,
    videoLinks: meta.videoLinks,
    publishedAt: meta.publishedAt,
  };
}

function mapAdminUser(row: AdminUserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    permissions: row.admin_permissions ?? [],
    createdAt: row.created_at,
  };
}

export function createAdminToolsRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/coupons', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'coupons');
      if (!user) return;
      const rows = (await sql`
        SELECT *
        FROM coupons
        ORDER BY created_at DESC
      `) as CouponRow[];
      res.json({ items: rows.map(mapCoupon) });
    } catch (e) {
      console.error('admin.coupons:list', e);
      res.status(500).json({ error: 'Could not load coupons.' });
    }
  });

  router.post('/coupons', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'coupons');
      if (!user) return;
      const parsed = parseCouponInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid coupon input.' });
        return;
      }
      const input = parsed.data;
      const rows = (await sql`
        INSERT INTO coupons (
          code,
          discount_type,
          amount,
          is_active,
          valid_from,
          valid_to,
          usage_limit,
          applicable_types,
          applicable_slugs,
          applicable_emails
        )
        VALUES (
          ${input.code},
          ${input.discountType},
          ${input.amount},
          ${input.isActive},
          ${input.validFrom},
          ${input.validTo},
          ${input.usageLimit},
          ${input.applicableTypes},
          ${input.applicableSlugs},
          ${input.applicableEmails}
        )
        RETURNING *
      `) as CouponRow[];
      res.status(201).json({ item: mapCoupon(rows[0]) });
    } catch (e) {
      console.error('admin.coupons:create', e);
      res.status(500).json({ error: 'Could not create coupon.' });
    }
  });

  router.patch('/coupons/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'coupons');
      if (!user) return;
      const parsed = parseCouponInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid coupon input.' });
        return;
      }
      const input = parsed.data;
      const rows = (await sql`
        UPDATE coupons
        SET
          code = ${input.code},
          discount_type = ${input.discountType},
          amount = ${input.amount},
          is_active = ${input.isActive},
          valid_from = ${input.validFrom},
          valid_to = ${input.validTo},
          usage_limit = ${input.usageLimit},
          applicable_types = ${input.applicableTypes},
          applicable_slugs = ${input.applicableSlugs},
          applicable_emails = ${input.applicableEmails}
        WHERE id = ${req.params.id}
        RETURNING *
      `) as CouponRow[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Coupon not found.' });
        return;
      }
      res.json({ item: mapCoupon(rows[0]) });
    } catch (e) {
      console.error('admin.coupons:update', e);
      res.status(500).json({ error: 'Could not update coupon.' });
    }
  });

  router.get('/articles', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'articles');
      if (!user) return;
      const rows = (await sql`
        SELECT *
        FROM catalog_items
        WHERE type = 'article'
        ORDER BY created_at DESC
      `) as CatalogItemRow[];
      res.json({ items: rows.map(mapArticle) });
    } catch (e) {
      console.error('admin.articles:list', e);
      res.status(500).json({ error: 'Could not load articles.' });
    }
  });

  router.get('/articles/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'articles');
      if (!user) return;
      const rows = (await sql`
        SELECT *
        FROM catalog_items
        WHERE id = ${req.params.id}
          AND type = 'article'
        LIMIT 1
      `) as CatalogItemRow[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Article not found.' });
        return;
      }
      res.json({ item: mapArticle(rows[0]) });
    } catch (e) {
      console.error('admin.articles:detail', e);
      res.status(500).json({ error: 'Could not load article.' });
    }
  });

  router.post('/articles', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'articles');
      if (!user) return;
      const parsed = parseArticleInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid article input.' });
        return;
      }
      const input = parsed.data;
      const metadata = {
        content: input.content,
        videoLinks: input.videoLinks,
        publishedAt: input.publishedAt,
      };
      const rows = (await sql`
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
          author_name,
          category,
          tags,
          metadata
        )
        VALUES (
          ${input.slug},
          'article',
          ${input.title},
          ${input.description},
          ${input.imageUrl},
          0,
          ${input.status},
          ${input.featured},
          ${input.authorName},
          ${input.authorName},
          ${input.category},
          ${input.tags},
          ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING *
      `) as CatalogItemRow[];
      res.status(201).json({ item: mapArticle(rows[0]) });
    } catch (e) {
      console.error('admin.articles:create', e);
      res.status(500).json({ error: 'Could not create article.' });
    }
  });

  router.patch('/articles/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'articles');
      if (!user) return;
      const parsed = parseArticleInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid article input.' });
        return;
      }
      const input = parsed.data;
      const metadata = {
        content: input.content,
        videoLinks: input.videoLinks,
        publishedAt: input.publishedAt,
      };
      const rows = (await sql`
        UPDATE catalog_items
        SET
          slug = ${input.slug},
          title = ${input.title},
          description = ${input.description},
          image_url = ${input.imageUrl},
          status = ${input.status},
          featured = ${input.featured},
          instructor_name = ${input.authorName},
          author_name = ${input.authorName},
          category = ${input.category},
          tags = ${input.tags},
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${req.params.id}
          AND type = 'article'
        RETURNING *
      `) as CatalogItemRow[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Article not found.' });
        return;
      }
      res.json({ item: mapArticle(rows[0]) });
    } catch (e) {
      console.error('admin.articles:update', e);
      res.status(500).json({ error: 'Could not update article.' });
    }
  });

  router.get('/analytics/summary', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'analytics');
      if (!user) return;

      const [revenueRows, revenueByModuleRows, dailySalesRows, monthlySalesRows, userRows, popularRows, liveRows, orderRows, locationRows, couponRows, trafficRows, sourceRows, pageRows] =
        await Promise.all([
          sql`
            SELECT COALESCE(SUM(total_amount), 0)::numeric AS total_revenue
            FROM orders
            WHERE status IN ('paid', 'shipping', 'delivered', 'refunded')
          `,
          sql`
            SELECT oi.item_type, COALESCE(SUM(oi.total_price), 0)::numeric AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status IN ('paid', 'shipping', 'delivered', 'refunded')
            GROUP BY oi.item_type
            ORDER BY revenue DESC
          `,
          sql`
            SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS label, COUNT(*)::int AS orders, COALESCE(SUM(total_amount), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '14 days'
            GROUP BY created_at::date
            ORDER BY label ASC
          `,
          sql`
            SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS label, COUNT(*)::int AS orders, COALESCE(SUM(total_amount), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY label ASC
          `,
          sql`
            SELECT
              COUNT(*)::int AS total_users,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_registrations,
              COUNT(*) FILTER (WHERE EXISTS (
                SELECT 1
                FROM user_entitlements ue
                WHERE ue.user_id = users.id
                  AND ue.last_accessed_at >= NOW() - INTERVAL '30 days'
              ))::int AS active_users
            FROM users
          `,
          sql`
            SELECT c.slug, c.title, c.students_count
            FROM catalog_items c
            WHERE c.type = 'course'
            ORDER BY c.students_count DESC, c.created_at DESC
            LIMIT 5
          `,
          sql`
            SELECT COUNT(*)::int AS attendance
            FROM user_entitlements ue
            JOIN catalog_items c ON c.id = ue.item_id
            WHERE c.type = 'live_class'
              AND ue.status = 'active'
          `,
          sql`
            SELECT oi.item_type, COUNT(*)::int AS orders_count, COALESCE(SUM(oi.total_price), 0)::numeric AS revenue
            FROM order_items oi
            GROUP BY oi.item_type
            ORDER BY orders_count DESC
          `,
          sql`
            SELECT COALESCE(city, 'Unknown') AS city, COALESCE(state, 'Unknown') AS state, COUNT(*)::int AS orders_count
            FROM book_shipments
            GROUP BY city, state
            ORDER BY orders_count DESC
            LIMIT 10
          `,
          sql`
            SELECT code, used_count, usage_limit
            FROM coupons
            ORDER BY used_count DESC, created_at DESC
            LIMIT 10
          `,
          sql`
            SELECT
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes')::int AS live_visitors,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')::int AS daily_visitors,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS monthly_visitors
            FROM site_visits
          `,
          sql`
            SELECT
              COALESCE(NULLIF(SPLIT_PART(REGEXP_REPLACE(referrer, '^https?://', ''), '/', 1), ''), 'direct') AS source,
              COUNT(*)::int AS visits
            FROM site_visits
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY source
            ORDER BY visits DESC
            LIMIT 8
          `,
          sql`
            SELECT path, COUNT(*)::int AS views
            FROM site_visits
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY path
            ORDER BY views DESC
            LIMIT 10
          `,
        ]);

      res.json({
        totals: {
          revenue: Number((revenueRows[0] as { total_revenue: string | number }).total_revenue ?? 0),
          users: (userRows[0] as { total_users: number }).total_users ?? 0,
          activeUsers: (userRows[0] as { active_users: number }).active_users ?? 0,
          newRegistrations: (userRows[0] as { new_registrations: number }).new_registrations ?? 0,
          liveClassAttendance: (liveRows[0] as { attendance: number }).attendance ?? 0,
        },
        revenueByModule: revenueByModuleRows.map((row) => ({
          module: (row as { item_type: string }).item_type,
          revenue: Number((row as { revenue: string | number }).revenue),
        })),
        dailySales: dailySalesRows.map((row) => ({
          label: (row as { label: string }).label,
          orders: (row as { orders: number }).orders,
          revenue: Number((row as { revenue: string | number }).revenue),
        })),
        monthlySales: monthlySalesRows.map((row) => ({
          label: (row as { label: string }).label,
          orders: (row as { orders: number }).orders,
          revenue: Number((row as { revenue: string | number }).revenue),
        })),
        popularCourses: popularRows.map((row) => ({
          slug: (row as { slug: string }).slug,
          title: (row as { title: string }).title,
          students: (row as { students_count: number }).students_count,
        })),
        orderBreakdown: orderRows.map((row) => ({
          module: (row as { item_type: string }).item_type,
          orders: (row as { orders_count: number }).orders_count,
          revenue: Number((row as { revenue: string | number }).revenue),
        })),
        bookOrdersByLocation: locationRows.map((row) => ({
          city: (row as { city: string }).city,
          state: (row as { state: string }).state,
          orders: (row as { orders_count: number }).orders_count,
        })),
        couponUsage: couponRows.map((row) => ({
          code: (row as { code: string }).code,
          usedCount: (row as { used_count: number }).used_count,
          usageLimit: (row as { usage_limit: number | null }).usage_limit,
        })),
        traffic: {
          liveVisitors: (trafficRows[0] as { live_visitors: number }).live_visitors ?? 0,
          dailyVisitors: (trafficRows[0] as { daily_visitors: number }).daily_visitors ?? 0,
          monthlyVisitors: (trafficRows[0] as { monthly_visitors: number }).monthly_visitors ?? 0,
          sources: sourceRows.map((row) => ({
            source: (row as { source: string }).source,
            visits: (row as { visits: number }).visits,
          })),
          mostViewedPages: pageRows.map((row) => ({
            path: (row as { path: string }).path,
            views: (row as { views: number }).views,
          })),
        },
      });
    } catch (e) {
      console.error('admin.analytics.summary', e);
      res.status(500).json({ error: 'Could not load analytics.' });
    }
  });

  router.get('/settings/site', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'settings');
      if (!user) return;
      const rows = await sql`
        SELECT home_scroller_enabled, home_scroller_message
        FROM site_settings
        WHERE id = 1
        LIMIT 1
      `;
      const row = rows[0] as { home_scroller_enabled: boolean; home_scroller_message: string | null } | undefined;
      res.json({
        settings: {
          homeScrollerEnabled: row?.home_scroller_enabled ?? false,
          homeScrollerMessage: row?.home_scroller_message ?? '',
        },
      });
    } catch (e) {
      console.error('admin.settings.site', e);
      res.status(500).json({ error: 'Could not load site settings.' });
    }
  });

  router.patch('/settings/site', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'settings');
      if (!user) return;
      const body = (req.body ?? {}) as Record<string, unknown>;
      const homeScrollerEnabled = body.homeScrollerEnabled === true;
      const homeScrollerMessage = parseOptionalString(body.homeScrollerMessage) ?? '';
      await sql`
        INSERT INTO site_settings (id, home_scroller_enabled, home_scroller_message)
        VALUES (1, ${homeScrollerEnabled}, ${homeScrollerMessage})
        ON CONFLICT (id)
        DO UPDATE
        SET
          home_scroller_enabled = EXCLUDED.home_scroller_enabled,
          home_scroller_message = EXCLUDED.home_scroller_message,
          updated_at = NOW()
      `;
      res.json({
        settings: {
          homeScrollerEnabled,
          homeScrollerMessage,
        },
      });
    } catch (e) {
      console.error('admin.settings.site:update', e);
      res.status(500).json({ error: 'Could not update site settings.' });
    }
  });

  router.get('/admin-users', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'admin_access');
      if (!user) return;
      const rows = (await sql`
        SELECT id, email, name, role, admin_permissions, created_at
        FROM users
        WHERE role IN ('staff', 'admin', 'super_admin')
        ORDER BY created_at DESC
      `) as AdminUserRow[];
      res.json({ items: rows.map(mapAdminUser), permissions: ADMIN_PERMISSION_KEYS });
    } catch (e) {
      console.error('admin.admin-users:list', e);
      res.status(500).json({ error: 'Could not load admin users.' });
    }
  });

  router.post('/admin-users', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'admin_access');
      if (!user || user.role !== 'super_admin') {
        if (user) res.status(403).json({ error: 'Only the super admin can create admin users.' });
        return;
      }
      const parsed = parseAdminUserInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid admin user input.' });
        return;
      }
      const input = parsed.data;
      if (!input.password) {
        res.status(400).json({ error: 'Password is required when creating an admin user.' });
        return;
      }
      const existing = await sql`SELECT id FROM users WHERE email = ${input.email} LIMIT 1`;
      if (existing.length > 0) {
        res.status(409).json({ error: 'A user with this email already exists.' });
        return;
      }
      const passwordHash = await hashPassword(input.password);
      const rows = (await sql`
        INSERT INTO users (email, password_hash, name, role, admin_permissions)
        VALUES (${input.email}, ${passwordHash}, ${input.name}, ${input.role}, ${input.permissions})
        RETURNING id, email, name, role, admin_permissions, created_at
      `) as AdminUserRow[];
      res.status(201).json({ item: mapAdminUser(rows[0]) });
    } catch (e) {
      console.error('admin.admin-users:create', e);
      res.status(500).json({ error: 'Could not create admin user.' });
    }
  });

  router.patch('/admin-users/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'admin_access');
      if (!user || user.role !== 'super_admin') {
        if (user) res.status(403).json({ error: 'Only the super admin can update admin users.' });
        return;
      }
      const parsed = parseAdminUserInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid admin user input.' });
        return;
      }
      const input = parsed.data;
      const passwordHash = input.password ? await hashPassword(input.password) : null;
      const rows = (await sql`
        UPDATE users
        SET
          email = ${input.email},
          name = ${input.name},
          role = ${input.role},
          admin_permissions = ${input.permissions},
          password_hash = COALESCE(${passwordHash}, password_hash)
        WHERE id = ${req.params.id}
          AND role IN ('staff', 'admin', 'super_admin')
        RETURNING id, email, name, role, admin_permissions, created_at
      `) as AdminUserRow[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Admin user not found.' });
        return;
      }
      res.json({ item: mapAdminUser(rows[0]) });
    } catch (e) {
      console.error('admin.admin-users:update', e);
      res.status(500).json({ error: 'Could not update admin user.' });
    }
  });

  return router;
}

export function createCatalogArticlesRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/articles/:slug', async (req, res) => {
    try {
      const rows = (await sql`
        SELECT *
        FROM catalog_items
        WHERE slug = ${req.params.slug}
          AND type = 'article'
          AND status = 'published'
        LIMIT 1
      `) as CatalogItemRow[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Article not found.' });
        return;
      }
      res.json({ item: mapArticle(rows[0]) });
    } catch (e) {
      console.error('catalog.articles:detail', e);
      res.status(500).json({ error: 'Could not load article.' });
    }
  });

  router.post('/track-visit', async (req, res) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const path = parseOptionalString(body.path);
      if (!path) {
        res.status(400).json({ error: 'Path is required.' });
        return;
      }
      const referrer = parseOptionalString(body.referrer);
      const user = await getSessionUser(req, sql);
      const visitorType = user ? (user.role === 'staff' || user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'registered') : 'guest';
      await sql`
        INSERT INTO site_visits (user_id, path, referrer, visitor_type)
        VALUES (${user?.id ?? null}, ${path}, ${referrer}, ${visitorType})
      `;
      res.json({ ok: true });
    } catch (e) {
      console.error('catalog.track-visit', e);
      res.status(500).json({ error: 'Could not track visit.' });
    }
  });

  return router;
}
