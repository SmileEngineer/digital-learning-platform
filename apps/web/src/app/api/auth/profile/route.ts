import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_PATH } from '@/lib/auth-cookie';
import { fetchUpstream } from '@/lib/upstream-fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function parseUpstreamJson(
  res: Response
): Promise<{ profile?: unknown; error?: string } | null> {
  try {
    return (await res.json()) as { profile?: unknown; error?: string };
  } catch {
    return null;
  }
}

function clearSessionCookie(out: NextResponse): NextResponse {
  out.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: AUTH_COOKIE_PATH,
    maxAge: 0,
  });
  return out;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const resOrErr = await fetchUpstream('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!(resOrErr instanceof Response)) {
    return NextResponse.json({ error: resOrErr.error }, { status: resOrErr.status });
  }

  const res = resOrErr;
  const data = await parseUpstreamJson(res);
  if (!data) {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 });
  }
  if (!res.ok && res.status === 401) {
    return clearSessionCookie(NextResponse.json(data, { status: res.status }));
  }
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
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

  const resOrErr = await fetchUpstream('/auth/profile', {
    method: 'PATCH',
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
  const data = await parseUpstreamJson(res);
  if (!data) {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 });
  }
  if (!res.ok && res.status === 401) {
    return clearSessionCookie(NextResponse.json(data, { status: res.status }));
  }
  return NextResponse.json(data, { status: res.status });
}
