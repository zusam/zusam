import http from "./http.js";

const api = {
  info: {},
  update: () =>
    http.get("/api/info", true).then(r => {
      if (!r) {
        return;
      }
      api.info = Object.assign({}, r);
      setTimeout(dispatchEvent(new CustomEvent("apiStateChange")));
      return r;
    }),
};
export default api;
