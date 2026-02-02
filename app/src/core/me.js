import http from "./http.js";
import storage from "./storage.js";
import { $me, updateMe, resetMe } from "/src/store/me.js";
import i18n from "i18next";

const me = {

  get() {
    return $me.get();
  },

  get data() {
    return $me.get()?.data;
  },

  get lang() {
    return $me.get()?.data?.lang;
  },

  get groups() {
    return $me.get()?.groups;
  },

  get id() {
    return $me.get()?.id;
  },

  get avatar() {
    return $me.get()?.avatar;
  },

  getGroupName(id) {
    let group = $me.get()?.groups?.find(g => g["id"] == id);
    return group ? group["name"] : "";
  },

  update() {
    return http.get("/api/me", true).then(r => {
      if (!r || !r?.id) {
        updateMe({});
        return null;
      }
      Promise.all(r.groups.map(g => http.get(`/api/groups/${g.id}`).catch(() => null).then(group => group))).then(
        groups => {
          r.groups = groups.filter(g => g != null);
          updateMe(Object.assign({loaded: true}, r));
        }
      );
      i18n.changeLanguage(r?.data?.lang);
      return r;
    }).catch(err => {
      if (err?.networkError) {
        // Network issue — don't clear user state
        return { _networkError: true };
      }
      // Auth failure (401/403) or other HTTP error — clear user state
      updateMe({});
      return null;
    });
  },

  fetch() {
    if ($me.get()["loaded"]) {
      return new Promise(r => r($me.get()));
    }
    return me.update();
  },

  reset() {
    resetMe();
  },

  logout() {
    storage.reset();
  }
};

export default me;
