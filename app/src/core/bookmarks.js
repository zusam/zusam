import http from "./http.js";
import store from "/src/store";

const bookmarks = {

  LIMIT: 1000,

  get() {
    return store.get()?.bookmarks || [];
  },

  update() {
    return http.get(`/api/me/bookmarks/${bookmarks.LIMIT + 1}`).then(r => {
      store.dispatch("bookmarks/update", r);
    });
  },

  matchBookmark(b, id) {
    if (b.id === id) {
      return true;
    }
    if (b.message.id === id) {
      return true;
    }
    return false;
  },

  removeAllBookmarks() {
    let state = store.get();
    if (Array.isArray(state["bookmarks"])) {
      state.bookmarks.forEach(n => store.dispatch("bookmarks/remove", n));
    }
  },

  removeMatchingBookmarks(id) {
    let state = store.get();
    if (Array.isArray(state["bookmarks"])) {
      state.bookmarks
        .filter(b => bookmarks.matchBookmark(b, id))
        .forEach(b => store.dispatch("bookmarks/remove", b));
    }
  },

  hasBookmark(id) {
    let state = store.get();
    if (Array.isArray(state.bookmarks)) {
      return state.bookmarks.some(b => bookmarks.matchBookmark(b, id));
    }
    return false;
  },

  addBookmark(message_id) {
    if (!bookmarks.hasBookmark(message_id)) {
      store.dispatch("bookmark/add", message_id);
    }
  },
};

export default bookmarks;
