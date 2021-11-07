import util from "./util.js";
import storage from "./storage.js";
import http from "./http.js";
import store from "/src/store";

const router = {

  get() {
    return store.get();
  },

  get route() {
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[0];
    } catch {
      return "";
    }
  },

  get id() {
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[1];
    } catch {
      return "";
    }
  },

  get action() {
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[2];
    } catch {
      return "";
    }
  },

  get backUrl() {
    console.err("don't use backUrl");
    return store.get()?.backUrl;
  },

  get search() {
    return location.search.slice(1);
  },

  getEntity() {
    if (router.isEntity(router.route)) {
      return http.get(`/api/${router.route}/${router.id}`);
    }
    return Promise.resolve(null);
  },

  get entity() {
    console.err("don't use entity");
    return store.get()?.entity;
  },

  removeSubpath: path =>
    path ? path.replace(new RegExp(`^${util.getSubpath()}`), "") : "",

  getParam: (param, searchParams = window.location.search.substring(1)) => {
    let res = searchParams.split("&").find(e => e.split("=")[0] === param);
    return res ? decodeURIComponent(res.split("=")[1]) : "";
  },

  getSegments: () =>
      router
      .removeSubpath(window.location.pathname)
      .slice(1)
      .split("?")[0]
      .split("/"),

  // check if route is "outside": accessible to non connected user
  isOutside: () =>
    [
      "login",
      "password-reset",
      "signup",
      "invitation",
      "stop-notification-emails",
      "public"
    ].includes(router.route || router.getSegments()[0]),

  isEntity: () => ["messages", "groups", "users", "links", "files"].includes(router.getSegments()[0]),

  getUrlComponents: url => {
    let components = {};
    if (url) {
      components.url = new URL(url);
      components.path = components.url.pathname;
      components.search = components.url.search.slice(1);
      [components.route, components.id, components.action] = router
        .removeSubpath(components.path)
        .slice(1)
        .split("/");
    }
    components.entityType = "";
    components.backUrl = "";
    return components;
  },
};
export default router;
