import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { hashPassword, signUserToken, verifyPassword, verifyUserToken } from '../auth/crypto.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBearer(req: { headers: { authorization?: string } }): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

export function createAuthRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.post('/register', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';

      if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters.' });
        return;
      }
      if (password.length > 256) {
        res.status(400).json({ error: 'Password is too long.' });
        return;
      }
      if (name.length < 1 || name.length > 200) {
        res.status(400).json({ error: 'Please enter your name (max 200 characters).' });
        return;
      }

      const existing = await sql`
        SELECT id FROM users WHERE email = ${emailRaw} LIMIT 1
      `;
      if (existing.length > 0) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      const passwordHash = await hashPassword(password);
      const inserted = await sql`
        INSERT INTO users (email, password_hash, name)
        VALUES (${emailRaw}, ${passwordHash}, ${name})
        RETURNING id, email, name, created_at
      `;

      const row = inserted[0] as { id: string; email: string; name: string };
      const token = signUserToken(row.id, row.email, row.name);

      res.status(201).json({
        token,
        user: { id: row.id, email: row.email, name: row.name },
      });
    } catch (e) {
      console.error('register', e);
      res.status(500).json({ error: 'Could not create account. Try again later.' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!emailRaw || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const rows = await sql`
        SELECT id, email, name, password_hash FROM users WHERE email = ${emailRaw} LIMIT 1
      `;
      if (rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const user = rows[0] as { id: string; email: string; name: string; password_hash: string };
      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = signUserToken(user.id, user.email, user.name);
      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (e) {
      console.error('login', e);
      res.status(500).json({ error: 'Could not sign in. Try again later.' });
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const token = parseBearer(req);
      if (!token) {
        res.status(401).json({ error: 'Not signed in.' });
        return;
      }
      const payload = verifyUserToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Session expired. Please sign in again.' });
        return;
      }

      const rows = await sql`
        SELECT id, email, name, created_at FROM users WHERE id = ${payload.sub} LIMIT 1
      `;
      if (rows.length === 0) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const u = rows[0] as { id: string; email: string; name: string; created_at: string };
      res.json({
        user: { id: u.id, email: u.email, name: u.name },
      });
    } catch (e) {
      console.error('me', e);
      res.status(500).json({ error: 'Could not load profile.' });
    }
  });

  return router;
}
