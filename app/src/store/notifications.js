export const notificationsStore = store => {
  store.on("@init", () => ({notifications:[]}));

  store.on("notifications/update", (state, notifications = []) => {
    return {notifications};
  });

  store.on("notifications/remove", (state, notification) => {
    return {
      notifications: state.notifications.filter(n => n.id != notification.id)
    };
  });

  store.on("notifications/read", (state, notification) => {
    return {
      notifications: state.notifications.map(n => n.id === notification.id ? Object.assign(n, {read: true}) : n)
    };
  });
};
