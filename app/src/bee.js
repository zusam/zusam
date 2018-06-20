/**
 * BEE is a tiny http query handler, cache handler and data store.
 * it's not general purpose but made specifically for Zusam.
 */
const bee = {
    // general utilities

    // get the id of an object from an url
    getId: url => url && url.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, ""),
    // get the url to a thubmnail (should be used with a file url)
    thumbnail: (url, width, height) => url && "/api/images/thumbnail/" + width + "/" + height + "/" + bee.getId(url),
    // same as http.thumbnail but for a crop
    crop: (url, width, height) => url && "/api/images/crop/" + width + "/" + height + "/" + bee.getId(url),

    // http methods
    http: {
        get: (url, nocache) => {
            return bee.get("apiKey").then(apiKey =>
                url && fetch(url, {
                    method: "GET",
                    headers: new Headers({
                        "Content-type": "application/json",
                        "X-AUTH-TOKEN": apiKey || "",
                        "X-NOCACHE": nocache,
                    }),
                }).then(
                    res => res.ok && res.json()
                ).catch(
                    err => console.warn("ERROR for " + url, err)
                )
            );
        },
        post: (url, data) => {
            return bee.get("apiKey").then(apiKey =>
                url && fetch(url, {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: new Headers({
                        "Content-type": "application/json",
                        "X-AUTH-TOKEN": apiKey || "",
                    }),
                }).then(
                    res => res.ok && res.json()
                ).catch(
                    err => console.warn("ERROR for " + url, err)
                )
            );
        },
    },

    // data store AND cache
    data: {},
    remove: id => window.localStorage.removeItem(id),
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
    get: id => {
        // not persistant data has more priority
        let data = bee.data[id];
        if (!data) {
            data = window.localStorage.getItem(id);
            data = data ? JSON.parse(data) : null;
        }
        if (data) {
            let c = data.cacheDuration || Infinity;
            if (data.timestamp > Date.now() - c) {
                return new Promise(r => r(data.data));
            }
        }
        // if it's an api resource, refresh it
        if (/^\/api/.test(id)) {
            let cacheDuration = 1; // no cache by default (1ms)
            if (/^\/api\/messages/.test(id)) {
                cacheDuration = 10 * 60 * 1000; // 10mn for a message (not likely to be changed often)
            }
            if (/^\/api\/(users|links)/.test(id)) {
                cacheDuration = 60 * 60 * 1000; // 60mn for a user
            }
            return bee.update(id, cacheDuration, false);
        }
        // if it's too old, remove it and return null
        bee.remove(id);
        return new Promise(r => r(null));
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => bee.http.get(url).then(res => {
        bee.set(url, res, cacheDuration, persistant);
        return new Promise(r => r(res));
    }),
    resetData: () => window.localStorage.clear(),
};
export default bee;
