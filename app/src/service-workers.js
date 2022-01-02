import { createStore, set, get } from "idb-keyval";

// update at the same time as the version in cache.js
const CACHE_VERSION = "@VERSION@";
const CACHE_NAME = `zusam-${CACHE_VERSION}`;

const cache_store = createStore(CACHE_NAME, CACHE_NAME);
const cached_routes = [
  {
    route: new RegExp("/api/users/[^/]+/?$"),
    duration: 1000 * 60 * 1, // 1mn
  },
  {
    route: new RegExp("/api/groups/[^/]+/?$"),
    duration: 1000 * 60 * 1, // 1mn
  },
  {
    route: new RegExp("/api/notifications/[^/]+/?$"),
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
            if (r && Object.protoype.hasOwnProperty.call(r, "updatedAt") && r.updatedAt != null) {
              const timeout = r.updatedAt + cached_routes.find(r => evt.request.url.match(r.route))["duration"];
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

// Add response to cache and store the lastUsedAt/updatedAt timestamp at the same time
function addToCache(cache, request, response) {
  return set(
    request.url,
    {
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
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
      caches.open(CACHE_NAME).then(cache => addToCache(cache, request, responseClone));
    }
    return response;
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match(request).then(matching => {
      if (matching) {
        // reset lastUsedAt
        return set(
          request.url,
          {
            lastUsedAt: Date.now()
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
  return caches.open(CACHE_NAME).then(cache => {
    return fetch(request).then(response => {
      return addToCache(cache, request, response);
    });
  });
}
