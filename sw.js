const CACHE_NAME = 'math-toolbox-v2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// نصب و کش کردن فایل‌های اصلی
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] در حال کش کردن فایل‌های اصلی...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // فوراً فعال شود
  );
});

// پاک کردن کش‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] حذف کش قدیمی:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتژی: اول کش، اگر نبود از شبکه
self.addEventListener('fetch', event => {
  // فقط درخواست‌های GET را مدیریت کن
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            // فقط پاسخ‌های موفق را کش کن
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
              return networkResponse;
            }

            // کپی از پاسخ را در کش ذخیره کن
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // اگر آفلاین بود و صفحه اصلی درخواست شده بود
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
