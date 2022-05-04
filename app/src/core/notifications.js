import http from "./http.js";
import store from "/src/store";

const notifications = {

  LIMIT: 20,

  get() {
    return store.get()?.notifications || [];
  },

  update() {
    return http.get(`/api/me/notifications/${notifications.LIMIT + 1}`).then(r => {
      store.dispatch("notifications/update", r);
    });
  },

  isNew(id) {
    let state = store.get();
    if (Array.isArray(state["notifications"])) {
      return state.notifications.some(
        n =>
          notifications.matchNotification(n, id) ||
          (n.type == "new_comment" && n.fromMessage.id === id)
      );
    }
    return false;
  },

  removeAllNotifications() {
    let state = store.get();
    if (Array.isArray(state["notifications"])) {
      state.notifications.forEach(n => store.dispatch("notifications/remove", n));
    }
  },

  removeMatchingNotifications(id) {
    return Promise.all(
      store.get().notifications
        .filter(n => notifications.matchNotification(n, id))
        .map(n => {
          http.delete(`/api/notifications/${n.id}`).then(() => {
            store.dispatch("notifications/remove", n);
          });
        })
    );
  },

  matchNotification(notif, id) {
    if (notif.id === id) {
      return true;
    }
    if (notif.target === id) {
      return true;
    }
    return false;
  },
};

export default notifications;
