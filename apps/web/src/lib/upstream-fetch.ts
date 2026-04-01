import { getInternalApiUrl } from '@/lib/server-api-url';

function upstreamUnavailableMessage(): string {
  const base = getInternalApiUrl();
  const isLocal = base.includes('localhost') || base.includes('127.0.0.1');
  if (process.env.NODE_ENV === 'production' && isLocal) {
    return `Cannot reach the API at ${base}. Set API_URL in your host environment (e.g. Netlify: Site settings → Environment variables) to your deployed Express API base URL (https://…). The API is not served by Netlify; deploy apps/api separately.`;
  }
  if (!isLocal) {
    return `Cannot reach the API at ${base}. Confirm the API is running, publicly reachable, and API_URL matches its base URL.`;
  }
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
  const timeoutMs = 25_000;
  const signal = init?.signal ?? AbortSignal.timeout(timeoutMs);
  try {
    return await fetch(url, { ...init, signal });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return {
        error:
          'The auth service did not respond in time. On Render’s free tier, cold starts can take 30–60s—wait and try again, or open your API /health URL once to wake the service.',
        status: 504,
      };
    }
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
