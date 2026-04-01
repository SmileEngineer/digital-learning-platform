/**
 * Runs SQL files in `db/migrations/*.sql` in order, tracking applied files in `schema_migrations`.
 * Usage: npm run db:migrate --workspace=api (from repo root: npm run db:migrate)
 */
import '../src/load-env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to apps/api/.env or the repo root .env');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const migrationsDir = path.join(__dirname, '../db/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('Missing migrations directory:', migrationsDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const applied = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [
      file,
    ]);
    if (applied.rowCount && applied.rowCount > 0) {
      console.log('[skip]', file);
      continue;
    }

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('[ok]', file);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('[fail]', file, e);
      throw e;
    }
  }

  await client.end();
  console.log('Migrations finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
