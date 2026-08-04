// این نسخه رو هر بار که آپدیت جدیدی منتشر می‌کنی، عوض کن (فقط همین یه خط کافیه)
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'fund-analyzer-' + CACHE_VERSION;
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// شبکه-اول: همیشه اول تلاش می‌کنه از اینترنت آخرین نسخه رو بگیره؛ فقط وقتی آفلاینی از کش (آخرین نسخه‌ی ذخیره‌شده) استفاده می‌کنه
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // درخواست به CDNهای خارجی (فونت/چارت‌جی‌اس) رو دست نمی‌زنیم

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
