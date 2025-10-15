const CACHE_NAME = 'hostel-bill-pro-v2.1.0';
const urlsToCache = [
  '/hostel-bill-manager/',
  '/hostel-bill-manager/index.html',
  '/hostel-bill-manager/new-bill.html',
  '/hostel-bill-manager/calculator.html',
  '/hostel-bill-manager/previous-bills.html',
  '/hostel-bill-manager/bill-detail.html',
  '/hostel-bill-manager/analytics.html',
  '/hostel-bill-manager/settings.html',
  '/hostel-bill-manager/categories.html',
  
  // Cache ALL icons
  '/hostel-bill-manager/icons/icon-72x72.png',
  '/hostel-bill-manager/icons/icon-96x96.png',
  '/hostel-bill-manager/icons/icon-128x128.png',
  '/hostel-bill-manager/icons/icon-144x144.png',
  '/hostel-bill-manager/icons/icon-152x152.png',
  '/hostel-bill-manager/icons/icon-192x192.png',
  '/hostel-bill-manager/icons/icon-384x384.png',
  '/hostel-bill-manager/icons/icon-512x512.png',
  
  // Cache ALL styles
  '/hostel-bill-manager/styles/common.css',
  '/hostel-bill-manager/styles/home.css',
  '/hostel-bill-manager/styles/new-bill.css',
  '/hostel-bill-manager/styles/calculator.css',
  '/hostel-bill-manager/styles/previous-bills.css',
  '/hostel-bill-manager/styles/analytics.css',
  '/hostel-bill-manager/styles/settings.css',
  '/hostel-bill-manager/styles/dark-mode.css',
  
  // Cache ALL scripts
  '/hostel-bill-manager/js/app.js',
  '/hostel-bill-manager/js/storage.js',
  '/hostel-bill-manager/js/calculator.js',
  '/hostel-bill-manager/js/previous-bills.js',
  '/hostel-bill-manager/js/analytics.js',
  '/hostel-bill-manager/js/settings.js',
  '/hostel-bill-manager/js/theme.js',
  
  '/hostel-bill-manager/manifest.json'
];

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        ).catch(function() {
          if (event.request.destination === 'document') {
            return caches.match('/hostel-bill-manager/index.html');
          }
        });
      }
    )
  );
});
