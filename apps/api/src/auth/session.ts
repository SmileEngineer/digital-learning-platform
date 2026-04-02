import type { Request, Response } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { verifyUserToken } from './crypto.js';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
};

function parseBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

export async function requireSessionUser(
  req: Request,
  res: Response,
  sql: NeonQueryFunction<false, false>
): Promise<SessionUser | null> {
  const token = parseBearer(req);
  if (!token) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }

  const payload = verifyUserToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
    return null;
  }

  const rows = await sql`
    SELECT id, email, name, role, phone
    FROM users
    WHERE id = ${payload.sub}
    LIMIT 1
  `;

  if (rows.length === 0) {
    res.status(401).json({ error: 'Account not found.' });
    return null;
  }

  const user = rows[0] as SessionUser;
  return user;
}
