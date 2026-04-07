import type { Request, Response } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { verifyUserToken } from './crypto.js';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  admin_permissions: string[];
};

export const ADMIN_PERMISSION_KEYS = [
  'courses',
  'ebooks',
  'books',
  'live_classes',
  'practice_exams',
  'coupons',
  'articles',
  'orders',
  'analytics',
  'settings',
  'admin_access',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number];

function isAdminRole(role: string): boolean {
  return role === 'staff' || role === 'admin' || role === 'super_admin';
}

export function hasAdminPermission(user: SessionUser, permission: AdminPermission): boolean {
  return user.role === 'super_admin' || user.admin_permissions.includes(permission);
}

function parseBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

async function loadSessionUser(
  sql: NeonQueryFunction<false, false>,
  token: string | null
): Promise<SessionUser | null> {
  if (!token) return null;

  const payload = verifyUserToken(token);
  if (!payload) return null;

  const rows = await sql`
    SELECT id, email, name, role, phone, admin_permissions, active_session_id
    FROM users
    WHERE id = ${payload.sub}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0] as SessionUser & { active_session_id: string | null };
  if (user.active_session_id !== payload.sessionId) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    admin_permissions: user.admin_permissions,
  };
}

export async function getSessionUser(
  req: Request,
  sql: NeonQueryFunction<false, false>
): Promise<SessionUser | null> {
  return loadSessionUser(sql, parseBearer(req));
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

  const user = await loadSessionUser(sql, token);
  if (!user) {
    res.status(401).json({ error: 'Account not found.' });
    return null;
  }

  return user;
}

export async function requireAdminUser(
  req: Request,
  res: Response,
  sql: NeonQueryFunction<false, false>
): Promise<SessionUser | null> {
  const user = await requireSessionUser(req, res, sql);
  if (!user) return null;
  if (!isAdminRole(user.role)) {
    res.status(403).json({ error: 'Admin access is required.' });
    return null;
  }
  return user;
}

export async function requireAdminPermission(
  req: Request,
  res: Response,
  sql: NeonQueryFunction<false, false>,
  permission: AdminPermission
): Promise<SessionUser | null> {
  const user = await requireAdminUser(req, res, sql);
  if (!user) return null;
  if (!hasAdminPermission(user, permission)) {
    res.status(403).json({ error: 'You do not have permission to access this admin area.' });
    return null;
  }
  return user;
}
