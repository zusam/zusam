const cache = {
  CACHE: "zusam-4.1-simplecache-0.2",
  removeMatching: str =>
    caches
      .open(cache.CACHE)
      .then(c =>
        c
          .matchAll()
          .then(a =>
            Promise.all(a.filter(e => e.url.match(str)).map(r => c.delete(e)))
          )
      )
};

export default cache;
