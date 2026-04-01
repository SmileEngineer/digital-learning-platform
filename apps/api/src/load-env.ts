/**
 * Loads `.env` from the monorepo root and `apps/api/.env`.
 * Paths differ when running `tsx src/...` (__dirname = `src`) vs `node dist/...` (__dirname = `dist`).
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  // Monorepo root — works from apps/api/src
  path.resolve(__dirname, '../../.env'),
  // Monorepo root — works from apps/api/dist
  path.resolve(__dirname, '../../../.env'),
  // Package-local (apps/api/.env)
  path.resolve(__dirname, '../.env'),
  // If cwd is repo root or apps/api
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

const loadedRealpaths = new Set<string>();

for (const p of candidates) {
  try {
    if (!fs.existsSync(p)) continue;
    const real = fs.realpathSync(p);
    if (loadedRealpaths.has(real)) continue;
    loadedRealpaths.add(real);
    dotenv.config({ path: p, override: true });
  } catch {
    // ignore missing or permission errors for a candidate
  }
}
