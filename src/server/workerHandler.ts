import { handleApiRoute } from './api';

export interface WorkerEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  BACKEND_URL?: string;
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

/**
 * Universal request handler for Cloudflare Workers & Cloudflare Pages Functions
 */
export async function handleWorkerRequest(request: Request, env: WorkerEnv = {}): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  // Handle Google AdSense & AdMob seller verification files
  if (path === '/ads.txt' || path === '/app-ads.txt') {
    return new Response('google.com, pub-2809682199317733, DIRECT, f08c47fec0942fa0\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Handle API routes
  if (path.startsWith('/api/')) {
    // Option B: If an external authoritative backend URL is provided, attempt proxy
    if (env.BACKEND_URL) {
      try {
        const backendBase = env.BACKEND_URL.replace(/\/+$/, '');
        const targetUrl = new URL(path + url.search, backendBase);
        const headers = new Headers(request.headers);
        headers.set('Host', new URL(backendBase).host);

        let bodyInit: BodyInit | undefined = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          bodyInit = await request.clone().arrayBuffer();
        }

        const backendRes = await fetch(targetUrl.toString(), {
          method: request.method,
          headers,
          body: bodyInit,
          redirect: 'manual'
        });

        const resHeaders = new Headers(backendRes.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(backendRes.body, {
          status: backendRes.status,
          statusText: backendRes.statusText,
          headers: resHeaders
        });
      } catch (proxyErr) {
        console.warn('Backend proxy failed, falling back to local edge execution:', proxyErr);
      }
    }

    // Option A: Execute locally on the edge runtime
    try {
      let body: any = {};
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        try {
          const rawText = await request.text();
          if (rawText && rawText.trim().length > 0) {
            body = JSON.parse(rawText);
          }
        } catch {
          return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          });
        }
      }

      const result = await handleApiRoute(path, body, env);
      return new Response(JSON.stringify(result.data), {
        status: result.status,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    } catch (err: any) {
      console.error(`Edge handler error for ${path}:`, err);
      return new Response(JSON.stringify({ error: 'Internal server error', details: err?.message || 'Unknown error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
  }

  // Non-API route: Serve static assets if ASSETS binding is available (Cloudflare Workers with assets)
  if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
    return env.ASSETS.fetch(request);
  }

  return new Response('Not found', { status: 404 });
}
