import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_PATH } from '@/lib/auth-cookie';
import { fetchUpstream } from '@/lib/upstream-fetch';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const resOrErr = await fetchUpstream('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!(resOrErr instanceof Response)) {
    return NextResponse.json({ error: resOrErr.error }, { status: resOrErr.status });
  }

  const res = resOrErr;
  let data: { user?: unknown; error?: string };
  try {
    data = (await res.json()) as { user?: unknown; error?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 });
  }

  if (!res.ok) {
    const out = NextResponse.json(data, { status: res.status });
    out.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: AUTH_COOKIE_PATH,
      maxAge: 0,
    });
    return out;
  }

  return NextResponse.json(data);
}
