// Cache implementation based on
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const CACHE_VERSION = "@VERSION@";
const CACHE_NAME = `zusam-${CACHE_VERSION}`;

const cached_routes = [
  {
    route: new RegExp("/api/images/crop/"),
  },
  {
    route: new RegExp("/api/images/thumbnail/"),
  },
  {
    route: new RegExp("/api/links/by_url\?"),
  }
];

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const handleRequest = async request => {
  // cache-update routes: retrieve from cache and update in background
  if (request.method == "GET" && cached_routes.some(r => request.url.match(r.route))) {
    return cacheFirst({ request });
  }
  return fetch(request);
};

const cacheFirst = async ({ request }) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};
