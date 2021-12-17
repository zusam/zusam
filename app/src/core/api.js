import http from "./http.js";
import store from "/src/store";

const api = {
  get info() {
    return store.get()?.api;
  },
  update: () =>
    http.get("/api/info", true).then(r => {
      if (!r) {
        return;
      }
      store.dispatch('api/update', Object.assign({}, r));
      setTimeout(dispatchEvent(new CustomEvent("apiStateChange")));
      return r;
    }),
};
export default api;
