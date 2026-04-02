export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'staff' | 'super_admin';
};

export async function readAuthError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? res.statusText ?? 'Request failed';
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

export async function postAuthLogout(): Promise<Response> {
  return fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
