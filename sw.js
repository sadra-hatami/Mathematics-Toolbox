const CACHE_NAME = 'math-toolbox-v1';
const urlsToCache = [
  './',
  './index.html',  // اسم فایل HTML اصلی خود را اینجا بنویسید
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
