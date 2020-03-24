const CACHE = 'zusam-4.1-simplecache-0.2';

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener('fetch', function(evt) {
  if (evt.request.method == "GET") {
    if (isCacheableUrl(evt.request.url)) {
      // You can use `respondWith()` to answer immediately, without waiting for the
      // network response to reach the service worker...
      evt.respondWith(fromCache(evt.request));
      // ...and `waitUntil()` to prevent the worker from being killed until the
      // cache is updated.
      evt.waitUntil(update(evt.request));
    } else {
      return fromNetwork(evt.request, false);
    }
  }
});

// Return true if the url is one we want to cache
function isCacheableUrl(url) {
  const routes = [
    '/api/images/crop/',
    '/api/images/thumbnail/',
  ];
  return routes.some(r => url.includes(r));
}

// Make a network request, return the result and add it to cache if asked
function fromNetwork(request, addToCache) {
    return fetch(request).then(function (response) {
      if (addToCache) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(request, responseClone);
        });
      }
      return response;
    });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      // if nothing matches, return response from network
      return matching || fromNetwork(request, true);
    });
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}
