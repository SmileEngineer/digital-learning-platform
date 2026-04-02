import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { fetchUpstream } from '@/lib/upstream-fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { path: string[] };

async function proxy(req: NextRequest, params: Promise<Params>) {
  const { path } = await params;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const upstreamPath = `/${path.join('/')}${req.nextUrl.search}`;
  const headers: HeadersInit = {};
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text();
  const resOrErr = await fetchUpstream(upstreamPath, {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
  });

  if (!(resOrErr instanceof Response)) {
    return NextResponse.json({ error: resOrErr.error }, { status: resOrErr.status });
  }

  const text = await resOrErr.text();
  const out = new NextResponse(text, { status: resOrErr.status });
  const upstreamType = resOrErr.headers.get('content-type');
  if (upstreamType) out.headers.set('content-type', upstreamType);
  return out;
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  return proxy(req, context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  return proxy(req, context.params);
}
