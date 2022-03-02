import { http } from "/src/core";

export const notificationsStore = store => {
  store.on("@init", () => ({notifications:[]}));

  store.on("notifications/update", (state, notifications = []) => {
    return {notifications};
  });

  store.on("notifications/remove", (state, notification) => {
    http.delete(`/api/notifications/${notification.id}`);
    return {
      notifications: state.notifications.filter(n => n.id != notification.id)
    };
  });
};
