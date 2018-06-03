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
        get: url => {
            return bee.get("apiKey").then(apiKey =>
                url && fetch(url, {
                    method: "GET",
                    headers: new Headers({
                        "Content-type": "application/json",
                        "X-AUTH-TOKEN": apiKey || "",
                    }),
                }).then(
                    res => res.json()
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
                    res => res.json()
                ).catch(
                    err => console.warn("ERROR for " + url, err)
                )
            );
        },
    },

    // data store AND cache
    data: {},
    remove: id => delete(bee.data[id]),
    set: (id, data, cacheDuration = Infinity, persistant = true) => {
        bee.data[id] = {
            data: data,
            timestamp: Date.now(),
            cacheDuration: cacheDuration,
            persistant: persistant,
        };
        if (persistant) {
            bee.saveData();
        }
    },
    get: (url, cacheDuration, persistant = false) => {
        if (!cacheDuration) {
            cacheDuration = 60 * 1000;
            if (/^\/api\/messages/.test(url)) {
                cacheDuration *= 5;
            }
        }
        if (bee.data[url] && bee.data[url].timestamp + bee.data[url].cacheDuration > Date.now()) {
            return new Promise(r => r(bee.data[url].data));
        }
        // if it's an api resource, refresh it
        if (/^\/api/.test(url)) {
            return bee.update(url, cacheDuration, persistant);
        }
        // if it's too old, remove it and return null
        bee.remove(url);
        return new Promise(r => r(null));
    },
    update: (url, cacheDuration = 60*1000, persistant = false) => bee.http.get(url).then(res => {
        bee.data[url] = {
            data: res,
            timestamp: Date.now(),
            cacheDuration: cacheDuration,
            persistant: persistant
        };
        if (persistant) {
            bee.saveData();
        }
        return new Promise(r => r(res));
    }),
    retrieveData: () => bee.data = JSON.parse(window.localStorage.getItem("data") || "{}") || {},
    saveData: () => window.localStorage.setItem("data", JSON.stringify(bee.data, (_,v) => {
        if (typeof(v) !== "object" || (v && v.persistant !== false)) {
            return v;
        }
        return undefined;
    }))
};
export default bee;
