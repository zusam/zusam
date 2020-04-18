import { Store, set, get, keys, del } from "idb-keyval";
import param from "./param.js";

const cache = {
  name: param.CACHE,
  cache_store: new Store(param.CACHE_STORE, param.CACHE),
  purgeOldCache: _ => {
    keys().then(keys =>
      keys.map(k =>
        get(k).then(e => {
          // purge if older than 30 days
          if (e.lastUsed + 1000 * 60 * 60 * 24 * 30 < Date.now()) {
            console.log("Remove from cache: " + k.url);
            del(k);
            caches.open(cache.name).then(c => c.delete(k));
          }
        })
      )
    );
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
