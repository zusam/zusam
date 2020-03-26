const storage = {
  usage: _ => {
    let total = 0;
    let k;
    for (k in localStorage) {
      if (localStorage.hasOwnProperty(k)) {
        total += ((localStorage[k].length + k.length) * 2);
      }
    }
    return total;
  },
  createStorageBox: (data, metadata = null) => ({
      data: data,
      createdAt: Date.now(),
      metadata: metadata
  }),
  remove: id => localStorage.removeItem(id),
  set: (id, data, metadata = null) => {
    localStorage.setItem(id, JSON.stringify(storage.createStorageBox(data, metadata)));
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
  reset: _ =>
    localStorage.clear() &&
    window.dispatchEvent(new CustomEvent("resetStorage"))
};
export default storage;
