import http from "./http.js";
const store = {
    data: {},
    get: (url, cacheDuration = 60*1000, persistant = false) => {
        if (store.data[url] && store.data[url].timestamp + store.data[url].cacheDuration > Date.now()) {
            return new Promise((resolve, _) => resolve(store.data[url].data));
        }
        return store.update(url, cacheDuration, persistant);
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => http.get(url).then(res => {
        store.data[url] = {
            data: res,
            timestamp: Date.now(),
            cacheDuration: cacheDuration,
            persistant: persistant
        };
        return new Promise((resolve, _) => resolve(res));
    }),
    retrieveData: () => store.data = JSON.parse(window.localStorage.getItem("data")),
    saveData: () => window.localStorage.setItem("data", JSON.stringify(store.data, e => e.persistant ? e : undefined))
};
export default store;
