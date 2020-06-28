import { Store, set, get } from "idb-keyval";
import param from "/core";

const cache_store = new Store(param.CACHE_STORE, param.CACHE);
const cached_routes = [
  {
    route: new RegExp("/api/users/[^/]+/?$"),
    duration: 1000 * 60 * 60 * 24, // 24h
  },
  {
    route: new RegExp("/api/images/crop/"),
    duration: 1000 * 60 * 60 * 24 * 365, // 1 year
  },
  {
    route: new RegExp("/api/images/thumbnail/"),
    duration: 1000 * 60 * 60 * 24 * 365, // 1 year
  },
  {
    route: new RegExp("/api/links/by_url\?"),
    duration: 1000 * 60 * 60 * 24 * 365, // 1 year
  }
];

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener("fetch", (evt) => {
  if (evt.request.method == "GET") {
    // cache-update routes: retrieve from cache and update in background
    if (cached_routes.some(r => evt.request.url.match(r.route))) {
      // You can use `respondWith()` to answer immediately, without waiting for the
      // network response to reach the service worker...
      evt.respondWith(fromCache(evt.request));

      // ...and `waitUntil()` to prevent the worker from being killed until the function is finished.
      evt.waitUntil(() => {
        get(evt.request.url, cache_store)
          .then(r => {
            if (r && Object.protoype.hasOwnProperty.call(r, "lastUsed") && r.lastUsed != null) {
              const timeout = r.lastUsed + cached_routes.find(r => evt.request.url.match(r.route))["duration"];
              // update the cache only if the timeout is reached
              if (timeout < Date.now()) {
                update(evt.request);
              }
            }
          })
          .catch(() => update(evt.request));
      });
    }
  }
});

// Add response to cache and store the lastUsed timestamp at the same time
function addToCache(cache, request, response) {
  return set(
    request.url,
    {
      lastUsed: Date.now()
    },
    cache_store
  ).then(() => cache.put(request, response));
}

// Make a network request, return the result and add it to cache if asked
function fromNetwork(request, toCache) {
  return fetch(request).then(response => {
    if (toCache) {
      // response may be used only once
      // we need to save clone to put one copy in cache
      // and serve second one
      let responseClone = response.clone();
      caches.open(param.CACHE).then(cache => addToCache(cache, request, responseClone));
    }
    return response;
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(param.CACHE).then(cache => {
    return cache.match(request).then(matching => {
      if (matching) {
        // reset lastUsed
        return set(
          request.url,
          {
            lastUsed: Date.now()
          },
          cache_store
        ).then(() => matching);
      }
        // if nothing matches, return response from network
        return fromNetwork(request, true);
    });
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  return caches.open(param.CACHE).then(cache => {
    return fetch(request).then(response => {
      return addToCache(cache, request, response);
    });
  });
}
