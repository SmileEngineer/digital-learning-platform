export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'staff' | 'super_admin';
  adminPermissions?: string[];
};

export type AuthProfile = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'staff' | 'super_admin';
  phone: string;
  bio: string;
  profileImageUrl: string | null;
};

export async function readAuthError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) {
      return res.statusText || 'Request failed';
    }

    try {
      const data = JSON.parse(text) as { error?: string };
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    } catch {
      // Fall back to the raw response body below.
    }

    return text.trim() || res.statusText || 'Request failed';
  } catch {
    return res.statusText || 'Request failed';
  }
}

/** Session via httpOnly cookie — proxied by Next.js to Express. */
export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function postAuthLogin(email: string, password: string): Promise<Response> {
  return fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
}

export async function postAuthRegister(
  name: string,
  email: string,
  password: string
): Promise<Response> {
  return fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function postAuthChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<Response> {
  return fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchAuthProfile(): Promise<AuthProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  const data = (await res.json()) as { profile: AuthProfile };
  return data.profile;
}

export async function patchAuthProfile(input: {
  name: string;
  email: string;
  phone: string;
  bio: string;
  profileImageUrl: string | null;
}): Promise<AuthProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  const data = (await res.json()) as { profile: AuthProfile };
  return data.profile;
}

export async function postAuthLogout(): Promise<Response> {
  return fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
