import { http } from "/src/core";

export const bookmarksStore = store => {
  store.on("@init", () => ({bookmarks:[]}));

  store.on("bookmarks/update", (state, bookmarks = []) => {
    return {bookmarks};
  });

  store.on("bookmarks/remove", (state, bookmark) => {
    http.delete(`/api/bookmarks/${bookmark.id}`);
    return {
      bookmarks: state.bookmarks.filter(b => b.id != bookmark.id)
    };
  });

  store.on("bookmark/add", (state, message_id) => {
    http.post("/api/bookmarks", {message:message_id}).then(bookmark => {
      store.dispatch("bookmarks/update", [...state.bookmarks, bookmark]);
    });
  });
};
