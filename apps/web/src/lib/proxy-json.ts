import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { fetchUpstream } from '@/lib/upstream-fetch';

export async function proxyJson(
  path: string,
  options?: {
    req?: NextRequest;
    init?: RequestInit;
  }
): Promise<NextResponse> {
  const headers = new Headers(options?.init?.headers);
  const token = options?.req?.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resOrErr = await fetchUpstream(path, {
    ...options?.init,
    headers,
  });

  if (!(resOrErr instanceof Response)) {
    return NextResponse.json({ error: resOrErr.error }, { status: resOrErr.status });
  }

  const text = await resOrErr.text();
  if (!text) {
    return NextResponse.json({}, { status: resOrErr.status });
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: resOrErr.status });
  } catch {
    return NextResponse.json({ error: 'Invalid response from upstream service.' }, { status: 502 });
  }
}
