import { Store, get, keys, del } from "idb-keyval";

// update at the same time as the version in service-workers.js
const CACHE_VERSION = "0.4";

const cache = {
  name: `zusam-simplecache-${CACHE_VERSION}`,
  cache_store: new Store(`zusam-${CACHE_VERSION}`, `zusam-simplecache-${CACHE_VERSION}`),
  purgeOldCache: () => {
    keys().then(keys =>
      keys.map(k =>
        get(k).then(e => {
          // purge if older than 30 days
          if (e.lastUsed + 1000 * 60 * 60 * 24 * 30 < Date.now()) {
            console.log(`Remove from cache: ${k.url}`);
            del(k);
            caches.open(cache.name).then(c => c.delete(k));
          }
        })
      )
    );
  },
  removeMatching: str => caches.open(cache.name).then(openCache => openCache.matchAll().then(a =>
      Promise.all(a.filter(e => e.url.match(str)).map(e => openCache.delete(e)))
    )
  )
};

export default cache;
