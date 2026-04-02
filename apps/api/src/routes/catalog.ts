import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { listCatalogItems, getCatalogItemBySlug, mapCatalogItem, type CatalogItemType } from '../platform.js';

function parseType(value: unknown): CatalogItemType | undefined {
  const allowed: CatalogItemType[] = ['course', 'ebook', 'physical_book', 'live_class', 'practice_exam', 'article'];
  return typeof value === 'string' && allowed.includes(value as CatalogItemType)
    ? (value as CatalogItemType)
    : undefined;
}

export function createCatalogRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/items', async (req, res) => {
    try {
      const type = parseType(req.query.type);
      const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
      const limitRaw = Number.parseInt(String(req.query.limit ?? '24'), 10);
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 24;
      const search = typeof req.query.q === 'string' ? req.query.q : undefined;

      const items = await listCatalogItems(sql, { type, featured, limit, search });
      res.json({ items });
    } catch (e) {
      console.error('catalog.items', e);
      res.status(500).json({ error: 'Could not load catalog items.' });
    }
  });

  router.get('/items/:slug', async (req, res) => {
    try {
      const row = await getCatalogItemBySlug(sql, req.params.slug);
      if (!row) {
        res.status(404).json({ error: 'Catalog item not found.' });
        return;
      }
      res.json({ item: mapCatalogItem(row) });
    } catch (e) {
      console.error('catalog.item', e);
      res.status(500).json({ error: 'Could not load catalog item.' });
    }
  });

  router.get('/highlights', async (_req, res) => {
    try {
      const [courses, ebooks, liveClasses, exams, books, articles, counts, settingRows] = await Promise.all([
        listCatalogItems(sql, { type: 'course', featured: true, limit: 3 }),
        listCatalogItems(sql, { type: 'ebook', featured: true, limit: 4 }),
        listCatalogItems(sql, { type: 'live_class', featured: true, limit: 3 }),
        listCatalogItems(sql, { type: 'practice_exam', limit: 4 }),
        listCatalogItems(sql, { type: 'physical_book', limit: 4 }),
        listCatalogItems(sql, { type: 'article', featured: true, limit: 4 }),
        sql`
          SELECT
            COUNT(*) FILTER (WHERE type = 'course' AND status = 'published')::int AS courses_count,
            COUNT(*) FILTER (WHERE type = 'ebook' AND status = 'published')::int AS ebooks_count,
            COUNT(*) FILTER (WHERE type = 'practice_exam' AND status = 'published')::int AS exams_count,
            (SELECT COUNT(*)::int FROM users) AS users_count
          FROM catalog_items
        `,
        sql`
          SELECT home_scroller_enabled, home_scroller_message
          FROM site_settings
          WHERE id = 1
        `,
      ]);

      const statsRow = counts[0] as {
        courses_count: number;
        ebooks_count: number;
        exams_count: number;
        users_count: number;
      };
      const settings = settingRows[0] as { home_scroller_enabled: boolean; home_scroller_message: string | null } | undefined;

      res.json({
        featuredCourses: courses,
        featuredEbooks: ebooks,
        upcomingLiveClasses: liveClasses,
        featuredExams: exams,
        featuredBooks: books,
        featuredArticles: articles,
        stats: {
          courses: statsRow?.courses_count ?? 0,
          students: statsRow?.users_count ?? 0,
          ebooks: statsRow?.ebooks_count ?? 0,
          successRate: 95,
        },
        scroller: {
          enabled: settings?.home_scroller_enabled ?? false,
          message: settings?.home_scroller_message ?? '',
        },
      });
    } catch (e) {
      console.error('catalog.highlights', e);
      res.status(500).json({ error: 'Could not load homepage highlights.' });
    }
  });

  return router;
}
