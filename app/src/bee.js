import alert from "./alert.js";
/**
 * BEE is a tiny http query handler, cache handler and data store.
 * it's not general purpose but made specifically for Zusam.
 */
const bee = {
    // general utilities

    // get the id of an object from an url
    getId: url => url ? url.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, "") : null,
    // get the url to a thubmnail (should be used with a file url)
    thumbnail: (url, width, height) => url ? "/api/images/thumbnail/" + width + "/" + height + "/" + bee.getId(url) : null,
    // same as http.thumbnail but for a crop
    crop: (url, width, height) => url ? "/api/images/crop/" + width + "/" + height + "/" + bee.getId(url) : null,

    // http methods
    http: {
        sendFile: (formData, loadFn, progressFn = null, errorFn = null) => {
            return bee.get("apiKey").then(apiKey => {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/files/upload", true);
                xhr.setRequestHeader("X-AUTH-TOKEN", apiKey)
                xhr.addEventListener("load", e => loadFn(JSON.parse(e.target.response)));
                if (progressFn) {
                    xhr.upload.onprogress = e => progressFn({loaded: e.loaded, total: e.total});
                }
                if (errorFn) {
                    xhr.addEventListener("error", e => errorFn(e));
                }
                xhr.send(formData);
            });
        },
        get: (url, nocache = false) => {
            return bee.get("apiKey").then(apiKey => {
                if (!url) {
                    return;
                }
                let h = {};
                if (apiKey) {
                    h["X-AUTH-TOKEN"] = apiKey;
                }
                if (nocache) {
                    h["X-NOCACHE"] = "nocache";
                }
                return fetch(url, {
                    method: "GET",
                    headers: new Headers(h),
                }).then(
                    res => res.ok && res.json()
                ).catch(
                    err => console.warn("ERROR for " + url, err)
                )
            });
        },
        post: (url, data, contentType = "application/json") => bee.http.request(url, data, "POST", contentType),
        put: (url, data, contentType = "application/json") => bee.http.request(url, data, "PUT", contentType),
        delete: (url, data, contentType = "application/json") => bee.http.request(url, null, "DELETE", contentType),
        request: (url, data, method, contentType = "application/json") => {
            return bee.get("apiKey").then(apiKey => {
                if (!url) {
                    return;
                }
                let h = {};
                if (apiKey) {
                    h["X-AUTH-TOKEN"] = apiKey;
                }
                if (contentType) {
                    h["Content-type"] = contentType;
                }
                let fetchOptions = {
                    method: method,
                    headers: new Headers(h),
                }
                if (data) {
                    fetchOptions.body = (typeof(data) == "object" && data.constructor.name == "Object") ? JSON.stringify(data) : data;
                }
                return fetch(url, fetchOptions).then(
                    res => method == "DELETE" ? res : res.json()
                ).catch(
                    err => console.warn("ERROR for " + url, err)
                )
            }).catch(error => alert.add(error));
        },
    },

    // reactive data store AND cache
    data: {},
    events: {},
    register: (event, resolve) => {
        if (typeof bee.events[event] === "undefined") {
            bee.events[event] = [];
        }
        bee.events[event].push(resolve);
    },
    remove: id => {
        delete(bee.data[id]);
        window.localStorage.removeItem(id);
    },
    set: (id, data, cacheDuration = Infinity, persistant = true) => {
        const storageBox = {
            data: data,
            timestamp: Date.now(),
            cacheDuration: cacheDuration
        };
        if (persistant) {
            window.localStorage.setItem(id, JSON.stringify(storageBox));
        } else {
            bee.data[id] = storageBox;
        }
    },
    get: (id, nocache = false) => {
        if (!id) {
            return;
        }
        // if nocache is false, try to load from the cache
        if (!nocache) {
            // not persistant data has more priority
            let data = bee.data[id];
            if (!data) {
                data = window.localStorage.getItem(id);
                data = data ? JSON.parse(data) : null;
            }
            if (data) {
                if (data.status == "pending") {
                    // a request for the resource was made. Let's wait for it
                    return new Promise(r => bee.register(id, r));
                }
                let c = data.cacheDuration || Infinity;
                if (data.timestamp > Date.now() - c) {
                    return new Promise(r => r(data.data));
                }
            }
        }
        // if it's an api resource, refresh it
        if (/^\/api/.test(id)) {
            let cacheDuration = 10000; // short cache by default to avoid double calls (10s)
            if (/^\/api\/messages/.test(id)) {
                cacheDuration = 10 * 60 * 1000; // 10mn for a message (not likely to be changed often)
            }
            if (/^\/api\/(users|links|groups|me)/.test(id)) {
                cacheDuration = 60 * 60 * 1000; // 60mn for a user/group/link
            }
            return bee.update(id, cacheDuration, false);
        }
        // if it's too old, remove it and return null
        bee.remove(id);
        return new Promise(r => r(null));
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => {
        bee.data[url] = Object.assign({status: "pending"}, bee.data[url]);
        return bee.http.get(url).then(res => {
            bee.set(url, res, cacheDuration, persistant);
            bee.data[url] = Object.assign({status: "ready"}, bee.data[url]);
            if (Array.isArray(bee.events[url])) {
                bee.events[url].forEach(r => r.call(null, bee.data[url].data));
            }
            delete(bee.events[url]);
            return new Promise(r => r(res));
        });
    },
    resetCache: () => {
        bee.data = {};
        bee.events = {};
        window.dispatchEvent(new CustomEvent("resetCache"));
    },
    reset: () => window.localStorage.clear() && bee.resetCache(),
};
export default bee;
