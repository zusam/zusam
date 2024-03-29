import alert from "./alert.js";
import storage from "./storage.js";
import util from "./util.js";

const http = {
  sendFile: (formData, loadFn, progressFn = null, errorFn = null) => {
    return storage
      .get("apiKey")
      .then(apiKey => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", `${document.baseURI}api/files`, true);
        xhr.setRequestHeader("X-AUTH-TOKEN", apiKey);
        xhr.addEventListener("load", e => {
          if (e.target.status > 199 && e.target.status < 300) {
            loadFn(JSON.parse(e.target.response));
          } else if (errorFn) {
            errorFn(e.target.statusText);
          } else {
            console.error(e.target.statusText);
          }
        });
        if (progressFn) {
          xhr.upload.onprogress = e =>
            progressFn({ loaded: e.loaded, total: e.total });
        }
        if (errorFn) {
          xhr.addEventListener("error", e => errorFn(e));
        }
        xhr.send(formData);
      })
      .catch(error => alert.add(error, "alert-danger"));
  },
  get: (url, nocache = false, delay = 0) => {
    return storage
      .get("apiKey")
      .then(x => new Promise(resolve => setTimeout(() => resolve(x), delay)))
      .then(apiKey => {
        url = util.toApp(url);
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
          headers: new Headers(h)
        })
          .then(res => res.ok && res.json())
          .catch(err => console.warn(`ERROR for ${url}`, err));
      })
      .catch(error => alert.add(error, "alert-danger"));
  },
  post: (url, data, delay = 0, contentType = "application/json") =>
    http.request(url, data, "POST", delay, contentType),
  put: (url, data, delay = 0, contentType = "application/json") =>
    http.request(url, data, "PUT", delay, contentType),
  delete: (url, data, delay = 0, contentType = "application/json") =>
    http.request(url, null, "DELETE", delay, contentType),
  request: (url, data, method, delay = 0, contentType = "application/json") => {
    return storage
      .get("apiKey")
      .then(x => new Promise(resolve => setTimeout(() => resolve(x), delay)))
      .then(apiKey => {
        url = util.toApp(url);
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
          method,
          headers: new Headers(h)
        };
        if (data) {
          fetchOptions.body =
            typeof data == "object" && data.constructor.name == "Object"
              ? JSON.stringify(data)
              : data;
        }
        return fetch(url, fetchOptions)
          .then(res => {
            try {
              if (method != "DELETE") {
                return res.json();
              }
              return {};
            } catch (exception) {
              console.warn(exception.message);
              return Promise.reject(exception.message);
            }
          })
          .catch(err => console.warn(`ERROR for ${url}`, err));
      })
      .catch(error => alert.add(error, "alert-danger"));
  }
};
export default http;
