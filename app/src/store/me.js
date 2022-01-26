//import { http } from "/src/core";

export const meStore = store => {
  store.on("@init", () => ({me: {}}));

  store.on("me/update", (state, me) => {
    return {me};
  });

  //store.on('bookmark/add', (state, id) => {
  //  if (!me.hasBookmark(id)) {
  //    http.post(`/api/bookmarks/${id}`).then(user => {
  //      store.dispatch('me/update', user);
  //    });
  //  }
  //})

  //store.on('bookmark/remove', (state, id) => {
  //  if (me.hasBookmark(id)) {
  //    http.delete(`/api/bookmarks/${id}`).then(user => {
  //      store.dispatch('me/update', user);
  //    });
  //  }
  //})
};
