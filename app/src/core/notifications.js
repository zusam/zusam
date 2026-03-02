import http from "./http.js";
import { $notifications, updateNotifications, removeNotification, readNotification } from "/src/store/notifications.js";

const notifications = {

  LIMIT: 20,

  get() {
    return $notifications.get() || [];
  },

  update() {
    return http.get(`/api/me/notifications/${notifications.LIMIT + 1}`).then(r => {
      if (r) updateNotifications(r);
    }).catch(() => null);
  },

  isNew(id) {
    let list = $notifications.get();
    if (Array.isArray(list)) {
      return list.filter(n => !n.read).some(
        n =>
          notifications.matchNotification(n, id) ||
          (n.type == "new_comment" && n.fromMessage.id === id)
      );
    }
    return false;
  },

  removeAllNotifications() {
    let list = $notifications.get();
    if (Array.isArray(list)) {
      list.forEach(n => {
        http.delete(`/api/notifications/${n.id}`).then(() => {
          removeNotification(n);
        }).catch(err => console.warn(err));
      });
    }
  },

  markAllNotificationsAsRead() {
    let list = $notifications.get();
    if (Array.isArray(list)) {
      list.forEach(n => {
        http.put(`/api/notifications/${n.id}`, {read: true}).then(() => {
          readNotification(n);
        }).catch(err => console.warn(err));
      });
    }
  },

  removeMatchingNotifications(id) {
    return Promise.all(
      $notifications.get()
        .filter(n => notifications.matchNotification(n, id))
        .map(n => {
          http.delete(`/api/notifications/${n.id}`).then(() => {
            removeNotification(n);
          }).catch(err => console.warn(err));
        })
    );
  },

  markAsRead(id) {
    return Promise.all(
      $notifications.get()
        .filter(n => notifications.matchNotification(n, id))
        .map(n => {
          http.put(`/api/notifications/${n.id}`, {read: true}).then(() => {
            readNotification(n);
          }).catch(err => console.warn(err));
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
