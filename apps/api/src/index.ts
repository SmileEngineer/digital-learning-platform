import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './load-env.js';
import cors from 'cors';
import express from 'express';
import { neon } from '@neondatabase/serverless';
import { createAuthRouter } from './routes/auth.js';
import { createAdminToolsRouter, createCatalogArticlesRouter } from './routes/admin-tools.js';
import { createAdminBooksRouter, createCatalogBooksRouter } from './routes/books.js';
import { createAdminCoursesRouter, createCoursesRouter, createMeRouter } from './routes/courses.js';
import { createCatalogRouter } from './routes/catalog.js';
import { createCheckoutRouter } from './routes/checkout.js';
import { createAdminEbooksRouter, createCatalogEbooksRouter, createLearnerEbooksRouter } from './routes/ebooks.js';
import { createLearnerRouter } from './routes/learner.js';
import { createAdminLiveClassesRouter, createLearnerLiveClassesRouter } from './routes/live-classes.js';
import { createAdminPracticeExamsRouter, createLearnerPracticeExamsRouter } from './routes/practice-exams.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

/** Comma-separated origins, e.g. `https://mysite.netlify.app,http://localhost:3000` */
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '5mb' }));

const dbUrl = process.env.DATABASE_URL;
const apiRoot = path.dirname(fileURLToPath(import.meta.url));
const ebookUploadsDir = path.join(apiRoot, 'uploads', 'ebooks');
fs.mkdirSync(ebookUploadsDir, { recursive: true });
app.use('/static/ebooks', express.static(ebookUploadsDir));

if (dbUrl) {
  const sql = neon(dbUrl);
  app.use('/auth', createAuthRouter(sql));
  app.use('/courses', createCoursesRouter(sql));
  app.use('/me', createMeRouter(sql));
  app.use('/admin', createAdminCoursesRouter(sql));
  app.use('/admin', createAdminToolsRouter(sql));
  app.use('/admin', createAdminBooksRouter(sql));
  app.use('/admin', createAdminEbooksRouter(sql, ebookUploadsDir));
  app.use('/admin', createAdminLiveClassesRouter(sql));
  app.use('/admin', createAdminPracticeExamsRouter(sql));
  app.use('/catalog', createCatalogRouter(sql));
  app.use('/catalog', createCatalogArticlesRouter(sql));
  app.use('/catalog', createCatalogBooksRouter(sql));
  app.use('/catalog', createCatalogEbooksRouter(sql));
  app.use('/checkout', createCheckoutRouter(sql));
  app.use('/learner', createLearnerRouter(sql));
  app.use('/learner', createLearnerEbooksRouter(sql));
  app.use('/learner', createLearnerLiveClassesRouter(sql));
  app.use('/learner', createLearnerPracticeExamsRouter(sql));
} else {
  console.warn('[api] DATABASE_URL is not set — auth routes return 503');
  const notReady = (_req: express.Request, res: express.Response) => {
    res.status(503).json({
      error:
        'The API is not configured: set DATABASE_URL on the API (e.g. Render environment variables) and redeploy.',
    });
  };
  app.use('/auth', notReady);
  app.use('/courses', notReady);
  app.use('/me', notReady);
  app.use('/admin', notReady);
  app.use('/catalog', notReady);
  app.use('/checkout', notReady);
  app.use('/learner', notReady);
}

app.get('/health', (_req, res) => {
  const hasDb = !!process.env.DATABASE_URL;
  const jwtOk = process.env.NODE_ENV !== 'production' || !!process.env.JWT_SECRET;
  res.json({
    ok: true,
    service: 'api',
    authReady: hasDb && jwtOk,
    databaseConfigured: hasDb,
    jwtConfigured: jwtOk,
  });
});

app.get('/db/health', async (_req, res) => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    res.status(503).json({ ok: false, error: 'DATABASE_URL is not set' });
    return;
  }
  try {
    const sql = neon(url);
    const rows = await sql`SELECT 1 AS ok`;
    res.json({ ok: true, neon: rows[0] });
  } catch (err) {
    res.status(503).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
