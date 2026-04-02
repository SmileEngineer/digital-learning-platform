import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/proxy-json';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.text();
  return proxyJson(`/courses/${encodeURIComponent(slug)}/progress`, {
    req,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  });
}
