/**
 * Production Service Worker — Aesthetic Pondok Indah Dental Clinic PWA
 * Version: 1.0.0
 */

const CACHE_STATIC_NAME = 'apig-static-v1.0.0';
const CACHE_DYNAMIC_NAME = 'apig-dynamic-v1.0.0';
const CACHE_API_NAME = 'apig-api-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo/logo.png',
  '/robots.txt'
];

// Security Exclusions - NEVER cache auth, private user data, or sensitive endpoints
const EXCLUDED_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/user\//,
  /\/api\/admin\//,
  /\/api\/membership\/payment\//,
  /\/api\/auth\//,
  /\/api\/user\//,
  /\/api\/admin\//,
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

  // 1. Bypass non-GET requests and security-sensitive URLs
  if (request.method !== 'GET') return;
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(url.pathname))) return;

  // 2. Public API GET Requests: Network-First Strategy
  if (url.pathname.includes('/api/public/') || url.pathname.includes('/wilayah/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_API_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(JSON.stringify({ error: 'Offline Mode: Data API tidak tersedia' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // 3. Google Fonts & Static Assets: Stale-While-Revalidate / Cache-First Strategy
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
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

  // 4. HTML Navigation Requests: Cache-First with Network Fallback & Offline Page
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
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
});


// =========================================================================
// 5. NATIVE MULTI-OS CLOUD WEB PUSH ENGINE (Android, iOS, macOS, Windows)
// =========================================================================

// Handle Push Message received from Google FCM / Apple APNs / Mozilla Push Cloud
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
  const options = {
    body: data.message || data.body || 'Pembaruan data reservasi pasien.',
    icon: data.icon || '/logo/logo.png',
    badge: data.badge || '/logo/logo.png',
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || ('apig-push-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || (data.data && data.data.url) || '/',
      time: Date.now(),
      bookingCode: data.bookingCode || (data.data && data.data.bookingCode),
    },
    actions: [
      {
        action: 'open_url',
        title: 'Lihat Detail',
        icon: '/logo/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle user clicking the notification sitting in the OS / Mobile device bar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Focus existing open window if any
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(fullTargetUrl);
          return client.focus();
        }
      }
      // 2. Open new window if none is open
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});

// Direct client message dispatcher
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_DEVICE_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/logo/logo.png',
        badge: options.badge || '/logo/logo.png',
        vibrate: options.vibrate || [200, 100, 200],
        tag: options.tag || ('apig-notif-' + Date.now()),
        renotify: true,
        requireInteraction: true,
        data: options.data || {},
      })
    );
  }
});