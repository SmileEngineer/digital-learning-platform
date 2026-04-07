import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
export type UserRole = 'student' | 'admin' | 'staff' | 'super_admin';

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-only-secret-change-me';
  }
  return s;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signUserToken(
  userId: string,
  email: string,
  name: string,
  role: UserRole,
  sessionId: string
): string {
  return jwt.sign({ sub: userId, email, name, role, sid: sessionId }, getJwtSecret(), { expiresIn: '7d' });
}

export type JwtUserPayload = { sub: string; email: string; name: string; role: UserRole; sessionId: string };

export function verifyUserToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & JwtUserPayload;
    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.name !== 'string' ||
      (decoded.role !== 'student' &&
        decoded.role !== 'admin' &&
        decoded.role !== 'staff' &&
        decoded.role !== 'super_admin') ||
      typeof decoded.sid !== 'string'
    ) {
      return null;
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      sessionId: decoded.sid,
    };
  } catch {
    return null;
  }
}
