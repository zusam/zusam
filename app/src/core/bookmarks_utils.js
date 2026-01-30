import http from "./http.js";
import { $bookmarks, updateBookmarks } from "/src/store/bookmarks.js";

const bookmarks_utils = {

  LIMIT: 1000,

  get() {
    return $bookmarks.get() || [];
  },

  update() {
    return http.get(`/api/me/bookmarks/${bookmarks_utils.LIMIT + 1}`).then(r => {
      if (r) updateBookmarks(r);
    }).catch(() => null);
  },
};

export default bookmarks_utils;
