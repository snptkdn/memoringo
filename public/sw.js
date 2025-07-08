const CACHE_NAME = 'memoringo-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// インストールイベント
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Taking control');
      return self.clients.claim();
    })
  );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // APIリクエストはキャッシュしない
  if (request.url.includes('/api/')) {
    return;
  }
  
  // メディアファイルは長期間キャッシュ
  if (request.url.includes('/api/media/file/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((fetchResponse) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // その他のリクエストはネットワークファーストで処理
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 成功したレスポンスをキャッシュ
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークが利用できない場合はキャッシュから返す
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // フォールバックページ
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// メッセージイベント
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});