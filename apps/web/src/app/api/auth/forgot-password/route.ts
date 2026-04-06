import { NextRequest, NextResponse } from 'next/server';
import { fetchUpstream } from '@/lib/upstream-fetch';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const resOrErr = await fetchUpstream('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
