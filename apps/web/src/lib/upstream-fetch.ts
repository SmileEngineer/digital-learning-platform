import { getInternalApiUrl } from '@/lib/server-api-url';

function upstreamUnavailableMessage(): string {
  const base = getInternalApiUrl();
  return `Cannot reach the API at ${base}. Start the Express server (e.g. npm run dev:api from the repo root).`;
}

export type UpstreamFailure = { error: string; status: number };

/**
 * Fetches the Express API from Next route handlers. Returns a friendly error when the server is down (ECONNREFUSED).
 */
export async function fetchUpstream(
  path: string,
  init?: RequestInit
): Promise<Response | UpstreamFailure> {
  const base = getInternalApiUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    return await fetch(url, init);
  } catch (e) {
    const code =
      e &&
      typeof e === 'object' &&
      'cause' in e &&
      (e as { cause?: { code?: string } }).cause?.code;
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
      return { error: upstreamUnavailableMessage(), status: 503 };
    }
    console.error('[upstream-fetch]', e);
    return {
      error: 'Could not reach the auth service. Check API_URL and that the API is running.',
      status: 503,
    };
  }
}
