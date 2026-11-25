/**
 * Production Service Worker — Aesthetic Pondok Indah Dental Clinic PWA
 * Version: 2.0.0
 */

const CACHE_STATIC_NAME = 'apig-static-v2.0.0';
const CACHE_DYNAMIC_NAME = 'apig-dynamic-v2.0.0';
const CACHE_API_NAME = 'apig-api-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo/logo.png',
  '/logo/logo-vertikal.webp',
  '/robots.txt'
];

// Security Exclusions - NEVER cache auth, private user data, or payment transactions
const EXCLUDED_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/user\/profile/,
  /\/api\/membership\/payment\//,
  /\/setup_backend\.php/,
  /\/data_setup\.php/
];

// Install Event - Pre-cache Static Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME && key !== CACHE_API_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Runtime Caching Strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests
  if (request.method !== 'GET') return;
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(url.pathname))) return;

  // 2. Public API GET Requests: Stale-While-Revalidate Strategy (Ultra Fast & Seamless Offline)
  if (url.pathname.includes('/api/public/') || url.pathname.includes('/wilayah/')) {
    event.respondWith(
      caches.open(CACHE_API_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // If network fails and cached response is available, return it
              if (cachedResponse) return cachedResponse;
              // Return silent empty payload instead of 503 error to prevent UI crashing
              return new Response(JSON.stringify([]), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
              });
            });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Static Assets, Images, Fonts, Scripts: Stale-While-Revalidate Strategy
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/layanan/') ||
    url.pathname.startsWith('/logo/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. HTML Navigation Requests: Network-First with Cache Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_STATIC_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html') || caches.match('/offline.html');
          });
        })
    );
    return;
  }
});

// =========================================================================
// 5. NATIVE MULTI-OS CLOUD WEB PUSH & BACKGROUND NOTIFICATIONS
// =========================================================================

// Handle Push Message received from FCM / Web Push in Background
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 Aesthetic Pondok Indah',
    body: 'Pembaruan reservasi & antrean klinik.',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const title = data.title || '🔔 Aesthetic Pondok Indah';
  const tag = data.tag || (data.bookingCode ? `apig-${data.bookingCode}` : `apig-push-${Date.now()}`);
  const targetUrl = data.url || (data.data && data.data.url) || '/';

  const options = {
    body: data.message || data.body || 'Pembaruan data reservasi pasien.',
    icon: data.icon || '/logo/logo-vertikal.webp',
    badge: data.badge || '/logo/logo-vertikal.webp',
    vibrate: data.vibrate || [200, 100, 200],
    tag: tag,
    renotify: false,
    requireInteraction: false,
    data: {
      url: targetUrl,
      time: Date.now(),
      bookingCode: data.bookingCode || (data.data && data.data.bookingCode),
    },
    actions: [
      {
        action: 'open_url',
        title: 'Lihat Detail',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle clicking OS Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(fullTargetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});

// Handle Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'apig-sync-reservations') {
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGER' });
        });
      })
    );
  }
});