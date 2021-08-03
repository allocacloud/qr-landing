var filesToCache = {{files}};
  
var staticCacheName = 'pages-cache-v-{{version}}';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache);
    }).catch(function () {})
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function (response) {
        return caches.open(staticCacheName).then(function (cache) {
          if (/\.(woff2|css|js|jpg|jpeg|png|svg|ico)$/.test(event.request.url) && !/googletagmanager/.test(event.request.url)) {
            cache.put(event.request.url, response.clone());
          }
          return response;
        }).catch(function (error) {
          console.error(error);
        });
      }).catch(function (error) {
        console.error(error);
      })
    }).catch(function (error) {
      console.error(error);
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});