import http from "./http.js";
const store = {
    data: {},
    remove: id => delete(store.data[id]),
    set: (id, data, cacheDuration = Infinity, persistant = true) => {
        store.data[id] = {
            data: data,
            timestamp: Date.now(),
            cacheDuration: cacheDuration,
            persistant: persistant,
        };
        if (persistant) {
            store.saveData();
        }
    },
    get: (url, cacheDuration = 60*1000, persistant = false) => {
        if (store.data[url] && store.data[url].timestamp + store.data[url].cacheDuration > Date.now()) {
            return new Promise(r => r(store.data[url].data));
        }
        // if it's an api resource, refresh it
        if (/^\/api/.test(url)) {
            return store.update(url, cacheDuration, persistant);
        }
        // if it's too old, remove it and return null
        store.remove(url);
        return new Promise(r => r(null));
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => http.get(url).then(res => {
        store.data[url] = {
            data: res,
            timestamp: Date.now(),
            cacheDuration: cacheDuration,
            persistant: persistant
        };
        if (persistant) {
            store.saveData();
        }
        return new Promise(r => r(res));
    }),
    retrieveData: () => store.data = JSON.parse(window.localStorage.getItem("data") || "{}") || {},
    saveData: () => window.localStorage.setItem("data", JSON.stringify(store.data, (_,v) => {
        if (typeof(v) !== "object" || (v && v.persistant !== false)) {
            return v;
        }
        return undefined;
    }))
};
export default store;
