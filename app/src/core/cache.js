import { Store, set, get, keys, del } from "idb-keyval";

const ZUSAM_VERSION = "4.1";
const CACHE_VERSION = "0.3";
const CACHE = "zusam-" + ZUSAM_VERSION + "-simplecache-" + CACHE_VERSION;

const cache = {
  name: CACHE,
  cache_store: new Store("zusam-" + ZUSAM_VERSION, CACHE),
  purgeOldCache: _ => {
    keys().then(keys => keys.map(k => get(k).then(e => {
      // purge if older than 30 days
      if(e.lastUsed + 1000 * 60 * 60 * 24 * 30 < Date.now()) {
        console.log("Remove from cache: " + k.url);
        del(k);
        caches.open(cache.name).then(c => c.delete(k));
      }
    })));
  },
  removeMatching: str =>
    caches
      .open(cache.name)
      .then(c =>
        c
          .matchAll()
          .then(a =>
            Promise.all(a.filter(e => e.url.match(str)).map(r => c.delete(e)))
          )
      )
};

export default cache;
