import './load-env.js';
import cors from 'cors';
import express from 'express';
import { neon } from '@neondatabase/serverless';
import { createAuthRouter } from './routes/auth.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const sql = neon(dbUrl);
  app.use('/auth', createAuthRouter(sql));
} else {
  console.warn('[api] DATABASE_URL is not set — POST /auth/register and /auth/login will not work');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api' });
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
