/**
 * Express API base URL (server-side only). Used by Next.js route handlers to proxy auth.
 */
export function getInternalApiUrl(): string {
  const raw = process.env.API_URL ?? process.env.INTERNAL_API_URL ?? 'http://localhost:4000';
  return raw.replace(/\/$/, '');
}
