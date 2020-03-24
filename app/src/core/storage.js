const storage = {
  data: {},
  remove: id => localStorage.removeItem(id),
  set: (id, data, cacheDuration = null) => {
    const storageBox = {
      data: data,
      timestamp: Date.now(),
      cacheDuration: cacheDuration
    };
    localStorage.setItem(id, JSON.stringify(storageBox));
    return Promise.resolve(id);
  },
  get: id => {
    let data = localStorage.getItem(id);
    if (data != null) {
      data = JSON.parse(data);
      if (data.hasOwnProperty("data")) {
        return new Promise(r => r(data.data));
      }
    }
    return new Promise(r => r(null));
  },
  reset: _ => localStorage.clear() && window.dispatchEvent(new CustomEvent("resetStorage")),
};
export default storage;
