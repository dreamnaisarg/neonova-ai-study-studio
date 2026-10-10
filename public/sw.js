// Service Worker for NEONOVA AI Homework Helper
const STATIC_CACHE = "neonova-static-v4";
const RUNTIME_CACHE = "neonova-runtime-v4";

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('Some precache assets could not be loaded immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept /api/ calls with service worker caching
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (App Shell)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResp = await fetch(event.request);
        // Cache the latest copy of index.html
        if (networkResp.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(event.request, networkResp.clone());
        }
        return networkResp;
      } catch (error) {
        // Fallback to cached app shell
        const cache = await caches.open(STATIC_CACHE);
        const cachedResp = await cache.match('/') || await cache.match('/index.html');
        if (cachedResp) {
          return cachedResp;
        }
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>NeoNova Offline</title></head><body style="background:#070b19;color:#38bdf8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>NeoNova Offline Mode</h2><p style="color:#94a3b8;font-size:13px;">Core features are operating locally.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    })());
    return;
  }

  // 2. Static Assets (Scripts, Styles, Fonts, Icons): Stale-While-Revalidate
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|ico)$/) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/@')
  ) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // Network failure, return cached version or undefined
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })());
  }
});
