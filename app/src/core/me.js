import http from "./http.js";
import storage from "./storage.js";
import store from "/src/store";
import i18n from "i18next";

const me = {

  get() {
    return store.get()?.me;
  },

  get data() {
    return store.get()?.me?.data;
  },

  get lang() {
    return store.get()?.me?.data?.lang;
  },

  get groups() {
    return store.get()?.me?.groups;
  },

  get id() {
    return store.get()?.me?.id;
  },

  get avatar() {
    return store.get()?.me?.avatar;
  },

  getGroupName(id) {
    let group = store.get()["groups"]?.find(g => g["id"] == id);
    return group ? group["name"] : "";
  },

  update() {
    return http.get("/api/me", true).then(r => {
      if (!r || !r?.id) {
        store.dispatch('update', {});
        return;
      }
      Promise.all(r.groups.map(g => http.get(`/api/groups/${g.id}`).then(group => group))).then(
        groups => {
          r.groups = groups;
          store.dispatch('me/update', Object.assign({loaded: true}, r));
        }
      );
      i18n.changeLanguage(r?.data?.lang);
      return r;
    });
  },

  fetch() {
    if (store.get()["loaded"]) {
      return new Promise(r => r(store.get()));
    }
    return me.update();
  },

  hasBookmark(id) {
    let state = store.get()?.me;
    if (Array.isArray(state?.data?.bookmarks)) {
      return state.data.bookmarks.some(bid => bid === id);
    }
    return false;
  },

  removeBookmark(id) {
    store.dispatch('bookmark/remove', id);
  },

  addBookmark(id) {
    store.dispatch('bookmark/add', id);
  },

  reset() {
    store.dispatch('@init');
  },

  logout() {
    storage.reset();
  }
}

export default me;
