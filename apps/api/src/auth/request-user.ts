import type { Request, Response } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { hasActiveSessionColumn } from './active-session.js';
import { verifyUserToken, type UserRole } from './crypto.js';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  admin_permissions?: string[];
};

export function parseBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

export async function getSessionUser(
  sql: NeonQueryFunction<false, false>,
  req: Request
): Promise<SessionUser | null> {
  const token = parseBearer(req);
  if (!token) return null;

  const payload = verifyUserToken(token);
  if (!payload) return null;

  const canTrackActiveSession = await hasActiveSessionColumn(sql);
  const rows = canTrackActiveSession
    ? await sql`
        SELECT id, email, name, role, admin_permissions, active_session_id
        FROM users
        WHERE id = ${payload.sub}
        LIMIT 1
      `
    : await sql`
        SELECT id, email, name, role, admin_permissions
        FROM users
        WHERE id = ${payload.sub}
        LIMIT 1
      `;
  if (rows.length === 0) return null;

  const user = rows[0] as SessionUser & { active_session_id: string | null };
  if (canTrackActiveSession && user.active_session_id !== payload.sessionId) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    admin_permissions: user.admin_permissions,
  };
}

export async function requireSessionUser(
  sql: NeonQueryFunction<false, false>,
  req: Request,
  res: Response
): Promise<SessionUser | null> {
  const user = await getSessionUser(sql, req);
  if (!user) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return null;
  }
  return user;
}

export async function requireAdminUser(
  sql: NeonQueryFunction<false, false>,
  req: Request,
  res: Response
): Promise<SessionUser | null> {
  const user = await requireSessionUser(sql, req, res);
  if (!user) return null;
  if (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'super_admin') {
    res.status(403).json({ error: 'Admin access is required.' });
    return null;
  }
  return user;
}
