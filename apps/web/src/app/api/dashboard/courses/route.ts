import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/proxy-json';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return proxyJson('/me/courses', { req });
}
