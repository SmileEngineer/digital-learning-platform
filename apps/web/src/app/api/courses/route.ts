import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/proxy-json';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  return proxyJson(`/courses${query ? `?${query}` : ''}`, { req });
}
