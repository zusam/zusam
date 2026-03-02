import http from "./http.js";
import { $api, updateApi } from "/src/store/api.js";

const api = {
  get info() {
    return $api.get();
  },
  update: () =>
    http.get("/api/info", true).then(r => {
      if (!r) {
        return;
      }
      updateApi(Object.assign({}, r));
      setTimeout(dispatchEvent(new CustomEvent("apiStateChange")));
      return r;
    }).catch(() => null),
};
export default api;
