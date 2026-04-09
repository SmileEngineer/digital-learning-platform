import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE_SEC,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_PATH,
} from '@/lib/auth-cookie';
import { fetchUpstream } from '@/lib/upstream-fetch';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const resOrErr = await fetchUpstream('/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!(resOrErr instanceof Response)) {
    return NextResponse.json({ error: resOrErr.error }, { status: resOrErr.status });
  }

  const res = resOrErr;
  let data: { token?: string; user?: unknown; error?: string };
  try {
    data = (await res.json()) as { token?: string; user?: unknown; error?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  if (!data.token || !data.user) {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 });
  }

  const out = NextResponse.json({ ok: true, user: data.user });
  out.cookies.set(AUTH_COOKIE_NAME, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: AUTH_COOKIE_PATH,
    maxAge: AUTH_COOKIE_MAX_AGE_SEC,
  });
  return out;
}
