import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { hasActiveSessionColumn } from '../auth/active-session.js';
import { getUserProfileColumnAvailability } from '../auth/profile-columns.js';
import { hashPassword, signUserToken, verifyPassword, verifyUserToken } from '../auth/crypto.js';
import { parseBearer } from '../auth/request-user.js';
import { sendPasswordResetEmail } from '../mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function isAllowedProfileImage(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) ||
    /^data:image\/(?:png|jpeg|jpg);base64,[a-z0-9+/=]+$/i.test(value)
  );
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
      const sessionId = randomBytes(32).toString('hex');
      const canTrackActiveSession = await hasActiveSessionColumn(sql);
      const inserted = canTrackActiveSession
        ? await sql`
            INSERT INTO users (email, password_hash, name, role, active_session_id)
            VALUES (${emailRaw}, ${passwordHash}, ${name}, 'student', ${sessionId})
            RETURNING id, email, name, role, admin_permissions, created_at
          `
        : await sql`
            INSERT INTO users (email, password_hash, name, role)
            VALUES (${emailRaw}, ${passwordHash}, ${name}, 'student')
            RETURNING id, email, name, role, admin_permissions, created_at
          `;

      const row = inserted[0] as {
        id: string;
        email: string;
        name: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        admin_permissions: string[];
      };
      const token = signUserToken(row.id, row.email, row.name, row.role, sessionId);

      res.status(201).json({
        token,
        user: {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role,
          adminPermissions: row.admin_permissions ?? [],
        },
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
        SELECT id, email, name, role, admin_permissions, password_hash FROM users WHERE email = ${emailRaw} LIMIT 1
      `;
      if (rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const user = rows[0] as {
        id: string;
        email: string;
        name: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        admin_permissions: string[];
        password_hash: string;
      };
      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const sessionId = randomBytes(32).toString('hex');
      if (await hasActiveSessionColumn(sql)) {
        await sql`
          UPDATE users
          SET active_session_id = ${sessionId}
          WHERE id = ${user.id}
        `;
      }

      const token = signUserToken(user.id, user.email, user.name, user.role, sessionId);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          adminPermissions: user.admin_permissions ?? [],
        },
      });
    } catch (e) {
      console.error('login', e);
      res.status(500).json({ error: 'Could not sign in. Try again later.' });
    }
  });

  router.post('/change-password', async (req, res) => {
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

      const body = req.body as Record<string, unknown>;
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required.' });
        return;
      }
      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters.' });
        return;
      }
      if (newPassword.length > 256) {
        res.status(400).json({ error: 'Password is too long.' });
        return;
      }
      if (currentPassword === newPassword) {
        res.status(400).json({ error: 'New password must be different from the current password.' });
        return;
      }

      const canTrackActiveSession = await hasActiveSessionColumn(sql);
      const rows = canTrackActiveSession
        ? await sql`
            SELECT id, email, name, role, admin_permissions, password_hash, active_session_id
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `
        : await sql`
            SELECT id, email, name, role, admin_permissions, password_hash
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `;

      if (rows.length === 0) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const user = rows[0] as {
        id: string;
        email: string;
        name: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        admin_permissions: string[];
        password_hash: string;
        active_session_id: string | null;
      };

      if (canTrackActiveSession && user.active_session_id !== payload.sessionId) {
        res.status(401).json({ error: 'This account is active on another device. Please sign in again.' });
        return;
      }

      const currentOk = await verifyPassword(currentPassword, user.password_hash);
      if (!currentOk) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }

      const passwordHash = await hashPassword(newPassword);
      const sessionId = randomBytes(32).toString('hex');

      if (canTrackActiveSession) {
        await sql`
          UPDATE users
          SET password_hash = ${passwordHash},
              active_session_id = ${sessionId}
          WHERE id = ${user.id}
        `;
      } else {
        await sql`
          UPDATE users
          SET password_hash = ${passwordHash}
          WHERE id = ${user.id}
        `;
      }

      const nextToken = signUserToken(user.id, user.email, user.name, user.role, sessionId);
      res.json({
        ok: true,
        token: nextToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          adminPermissions: user.admin_permissions ?? [],
        },
      });
    } catch (e) {
      console.error('change-password', e);
      res.status(500).json({ error: 'Could not update password.' });
    }
  });

  router.get('/profile', async (req, res) => {
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

      const canTrackActiveSession = await hasActiveSessionColumn(sql);
      const profileColumns = await getUserProfileColumnAvailability(sql);
      const rows =
        canTrackActiveSession && profileColumns.bio && profileColumns.profileImageUrl
          ? await sql`
              SELECT id, email, name, role, phone, bio, profile_image_url, active_session_id
              FROM users
              WHERE id = ${payload.sub}
              LIMIT 1
            `
          : canTrackActiveSession
            ? await sql`
                SELECT id, email, name, role, phone, active_session_id
                FROM users
                WHERE id = ${payload.sub}
                LIMIT 1
              `
            : profileColumns.bio && profileColumns.profileImageUrl
              ? await sql`
                  SELECT id, email, name, role, phone, bio, profile_image_url
                  FROM users
                  WHERE id = ${payload.sub}
                  LIMIT 1
                `
              : await sql`
                  SELECT id, email, name, role, phone
                  FROM users
                  WHERE id = ${payload.sub}
                  LIMIT 1
                `;

      if (rows.length === 0) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const user = rows[0] as {
        id: string;
        email: string;
        name: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        phone: string | null;
        bio?: string | null;
        profile_image_url?: string | null;
        active_session_id?: string | null;
      };

      if (canTrackActiveSession && user.active_session_id !== payload.sessionId) {
        res.status(401).json({ error: 'This account is active on another device. Please sign in again.' });
        return;
      }

      res.json({
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone ?? '',
          bio: profileColumns.bio ? (user.bio ?? '') : '',
          profileImageUrl: profileColumns.profileImageUrl ? (user.profile_image_url ?? null) : null,
        },
      });
    } catch (e) {
      console.error('profile:get', e);
      res.status(500).json({ error: 'Could not load profile settings.' });
    }
  });

  router.patch('/profile', async (req, res) => {
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

      const profileColumns = await getUserProfileColumnAvailability(sql);
      if (!profileColumns.bio || !profileColumns.profileImageUrl) {
        res.status(503).json({ error: 'Profile settings storage is not ready. Run the latest database migrations.' });
        return;
      }

      const canTrackActiveSession = await hasActiveSessionColumn(sql);
      const rows = canTrackActiveSession
        ? await sql`
            SELECT id, role, active_session_id
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `
        : await sql`
            SELECT id, role
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `;

      if (rows.length === 0) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const current = rows[0] as {
        id: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        active_session_id?: string | null;
      };

      if (canTrackActiveSession && current.active_session_id !== payload.sessionId) {
        res.status(401).json({ error: 'This account is active on another device. Please sign in again.' });
        return;
      }

      const body = req.body as Record<string, unknown>;
      const name = parseOptionalString(body.name);
      const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const phone = parseOptionalString(body.phone);
      const bio = parseOptionalString(body.bio);
      const profileImageUrlInput =
        body.profileImageUrl === null || body.profileImageUrl === ''
          ? null
          : parseOptionalString(body.profileImageUrl);

      if (!name || name.length > 200) {
        res.status(400).json({ error: 'Please enter your name (max 200 characters).' });
        return;
      }
      if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }
      if (phone && phone.length > 32) {
        res.status(400).json({ error: 'Phone number is too long.' });
        return;
      }
      if (bio && bio.length > 1500) {
        res.status(400).json({ error: 'Bio must be 1500 characters or fewer.' });
        return;
      }
      if (profileImageUrlInput) {
        if (!isAllowedProfileImage(profileImageUrlInput)) {
          res.status(400).json({ error: 'Profile photo must be a JPG/PNG image or a valid image URL.' });
          return;
        }
        if (profileImageUrlInput.startsWith('data:image/') && profileImageUrlInput.length > 3_000_000) {
          res.status(400).json({ error: 'Profile photo is too large. Use a JPG or PNG under 2MB.' });
          return;
        }
      }

      const existing = await sql`
        SELECT id
        FROM users
        WHERE email = ${emailRaw}
          AND id <> ${current.id}
        LIMIT 1
      `;
      if (existing.length > 0) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      await sql`
        UPDATE users
        SET
          name = ${name},
          email = ${emailRaw},
          phone = ${phone},
          bio = ${bio},
          profile_image_url = ${profileImageUrlInput}
        WHERE id = ${current.id}
      `;

      res.json({
        profile: {
          id: current.id,
          email: emailRaw,
          name,
          role: current.role,
          phone: phone ?? '',
          bio: bio ?? '',
          profileImageUrl: profileImageUrlInput,
        },
      });
    } catch (e) {
      console.error('profile:update', e);
      res.status(500).json({ error: 'Could not save profile settings.' });
    }
  });

  router.post('/forgot-password', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }

      const rows = await sql`
        SELECT id FROM users WHERE email = ${emailRaw} LIMIT 1
      `;
      if (rows.length === 0) {
        res.json({ ok: true });
        return;
      }

      const userId = (rows[0] as { id: string }).id;
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await sql`
        DELETE FROM password_reset_tokens WHERE user_id = ${userId}
      `;
      await sql`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
      `;

      await sendPasswordResetEmail(emailRaw, rawToken);
      res.json({ ok: true });
    } catch (e) {
      console.error('forgot-password', e);
      res.status(500).json({ error: 'Could not process password reset request.' });
    }
  });

  router.post('/reset-password', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const token = typeof body.token === 'string' ? body.token.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!token || token.length < 20) {
        res.status(400).json({ error: 'Invalid or expired reset link.' });
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

      const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
      const found = await sql`
        SELECT user_id
        FROM password_reset_tokens
        WHERE token_hash = ${tokenHash}
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT 1
      `;
      if (found.length === 0) {
        res.status(400).json({ error: 'Invalid or expired reset link.' });
        return;
      }

      const userId = (found[0] as { user_id: string }).user_id;
      const passwordHash = await hashPassword(password);
      await sql`
        UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}
      `;
      await sql`
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE token_hash = ${tokenHash}
      `;

      res.json({ ok: true });
    } catch (e) {
      console.error('reset-password', e);
      res.status(500).json({ error: 'Could not reset password.' });
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

      const canTrackActiveSession = await hasActiveSessionColumn(sql);
      const rows = canTrackActiveSession
        ? await sql`
            SELECT id, email, name, role, admin_permissions, active_session_id, created_at
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `
        : await sql`
            SELECT id, email, name, role, admin_permissions, created_at
            FROM users
            WHERE id = ${payload.sub}
            LIMIT 1
          `;
      if (rows.length === 0) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const u = rows[0] as {
        id: string;
        email: string;
        name: string;
        role: 'student' | 'admin' | 'staff' | 'super_admin';
        admin_permissions: string[];
        active_session_id: string | null;
        created_at: string;
      };
      if (canTrackActiveSession && u.active_session_id !== payload.sessionId) {
        res.status(401).json({ error: 'This account is active on another device. Please sign in again.' });
        return;
      }
      res.json({
        user: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          adminPermissions: u.admin_permissions ?? [],
        },
      });
    } catch (e) {
      console.error('me', e);
      res.status(500).json({ error: 'Could not load profile.' });
    }
  });

  return router;
}
