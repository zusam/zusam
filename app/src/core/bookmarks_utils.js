import http from "./http.js";
import store from "/src/store";

const bookmarks_utils = {

  LIMIT: 1000,

  get() {
    return store.get()?.bookmarks || [];
  },

  update() {
    return http.get(`/api/me/bookmarks/${bookmarks_utils.LIMIT + 1}`).then(r => {
      store.dispatch("bookmarks/update", r);
    });
  },
};

export default bookmarks_utils;
