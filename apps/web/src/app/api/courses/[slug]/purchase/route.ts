import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/proxy-json';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyJson(`/courses/${encodeURIComponent(slug)}/purchase`, {
    req,
    init: { method: 'POST' },
  });
}
