/**
 * sw.js — Service Worker (Cache-First strategy)
 * Version: 1.0.0
 *
 * 快取所有本地資源，確保離線可完整使用。
 */

const CACHE_NAME = 'md-editor-v6';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/editor.css',
  '/css/tabs.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/editor.js',
  '/js/preview.js',
  '/js/storage.js',
  '/js/tabs.js',
  '/js/settings.js',
  '/js/cloud.js',
  '/js/i18n.js',
  '/locales/zh-TW.json',
  '/locales/en.json',
  '/locales/vi.json',
  '/locales/sample-zh-TW.md',
  '/locales/sample-en.md',
  '/locales/sample-vi.md',
  '/vendor/easymde.min.js',
  '/vendor/easymde.min.css',
  '/vendor/marked.min.js',
  '/vendor/mermaid.min.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// Install: pre-cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS.filter(url => !url.includes('icon'))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pre-cache error:', err))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-First for HTML navigation, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Let Google API requests go through normally (need network)
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('accounts.google.com') ||
      url.hostname.includes('apis.google.com')) {
    return; // Browser default
  }

  // Network-First for HTML navigation — ensures reload always gets latest index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-First for all other local assets (JS, CSS, vendor libs, etc.)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
