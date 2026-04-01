import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { neon } from '@neondatabase/serverless';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json());

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
