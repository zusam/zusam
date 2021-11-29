import http from "./http.js";
import store from "/src/store";

const notifications = {

  get() {
    return store.get()?.notifications || [];
  },

  update() {
    return http.get(`/api/me/notifications/100`).then(r => {
      store.dispatch('notifications/update', r);
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
      state.notifications.forEach(n => store.dispatch('notifications/remove', n))
    }
  },

  removeMatchingNotifications(id) {
    let state = store.get();
    if (Array.isArray(state["notifications"])) {
      state.notifications
        .filter(n => notifications.matchNotification(n, id))
        .forEach(n => store.dispatch('notifications/remove', n));
    }
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
}

export default notifications;