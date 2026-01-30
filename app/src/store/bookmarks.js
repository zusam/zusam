import { atom } from "nanostores";
import { http } from "/src/core";

export const $bookmarks = atom([]);

export function updateBookmarks(bookmarks = []) {
  $bookmarks.set(bookmarks);
}

export function removeBookmark(bookmark) {
  http.delete(`/api/bookmarks/${bookmark.id}`).catch(err => console.warn(err));
  $bookmarks.set(
    $bookmarks.get().filter(b => b.id != bookmark.id)
  );
}

export function addBookmark(message_id) {
  const current = $bookmarks.get();
  http.post("/api/bookmarks", { message_id }).then(bookmark => {
    if (bookmark) updateBookmarks([...current, bookmark]);
  }).catch(() => null);
}
