const CACHE_NAME = 'blockboard-shell-v8';
const APP_FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // cache:'reload' দিয়ে HTTP cache bypass করে সবসময় fresh network fetch
      Promise.all(APP_FILES.map(url =>
        fetch(new Request(url, { cache: 'reload' })).then(res => cache.put(url, res))
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // ব্রাউজার এক্সটেনশন বা অন্য কোনো unsupported scheme (chrome-extension:// ইত্যাদি)
  // থেকে আসা রিকোয়েস্ট Cache API সাপোর্ট করে না, তাই সেগুলো এড়িয়ে যাওয়া হচ্ছে
  if (!event.request.url.startsWith('http')) return;

  // Navigation (HTML) request → network-first, cache শুধু fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // বাকি static assets → cache-first (আগের মতোই)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: 'Blockboard', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Blockboard';
  const options = { body: data.body || '', icon: './icon.svg', badge: './icon.svg' };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

