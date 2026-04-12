import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { listCatalogItems, getCatalogItemBySlug, mapCatalogItem, type CatalogItemType } from '../platform.js';
import {
  DEFAULT_HOME_BANNER,
  DEFAULT_MODULE_CATEGORIES,
  DEFAULT_SITE_NAVIGATION,
  parseHomeBanner,
  parseModuleCategories,
  parseNavigationConfig,
} from '../site-config-defaults.js';

function parseType(value: unknown): CatalogItemType | undefined {
  const allowed: CatalogItemType[] = ['course', 'ebook', 'physical_book', 'live_class', 'practice_exam', 'article'];
  return typeof value === 'string' && allowed.includes(value as CatalogItemType)
    ? (value as CatalogItemType)
    : undefined;
}

export function createCatalogRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  async function readSiteConfig() {
    const rows = await sql`
      SELECT
        home_scroller_enabled,
        home_scroller_message,
        home_banner_eyebrow,
        home_banner_title,
        home_banner_description,
        course_navigation,
        ebook_navigation,
        module_categories
      FROM site_settings
      WHERE id = 1
      LIMIT 1
    `;

    const row =
      rows[0] as
        | {
            home_scroller_enabled: boolean;
            home_scroller_message: string | null;
            home_banner_eyebrow: string | null;
            home_banner_title: string | null;
            home_banner_description: string | null;
            course_navigation: unknown;
            ebook_navigation: unknown;
            module_categories: unknown;
          }
        | undefined;

    return {
      scroller: {
        enabled: row?.home_scroller_enabled ?? false,
        message: row?.home_scroller_message ?? '',
      },
      homeBanner: parseHomeBanner({
        eyebrow: row?.home_banner_eyebrow ?? DEFAULT_HOME_BANNER.eyebrow,
        title: row?.home_banner_title ?? DEFAULT_HOME_BANNER.title,
        description: row?.home_banner_description ?? DEFAULT_HOME_BANNER.description,
      }),
      navigation: parseNavigationConfig({
        courses: row?.course_navigation ?? DEFAULT_SITE_NAVIGATION.courses,
        ebooks: row?.ebook_navigation ?? DEFAULT_SITE_NAVIGATION.ebooks,
      }),
      moduleCategories: parseModuleCategories(row?.module_categories ?? DEFAULT_MODULE_CATEGORIES),
    };
  }

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
      const [courses, ebooks, liveClasses, exams, books, articles, counts, siteConfig] = await Promise.all([
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
        readSiteConfig(),
      ]);

      const statsRow = counts[0] as {
        courses_count: number;
        ebooks_count: number;
        exams_count: number;
        users_count: number;
      };

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
        scroller: siteConfig.scroller,
        homeBanner: siteConfig.homeBanner,
      });
    } catch (e) {
      console.error('catalog.highlights', e);
      res.status(500).json({ error: 'Could not load homepage highlights.' });
    }
  });

  router.get('/site-config', async (_req, res) => {
    try {
      res.json(await readSiteConfig());
    } catch (e) {
      console.error('catalog.site-config', e);
      res.status(500).json({ error: 'Could not load site configuration.' });
    }
  });

  return router;
}
