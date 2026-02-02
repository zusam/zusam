import { atom } from "nanostores";

export const $notifications = atom([]);

export function updateNotifications(notifications = []) {
  $notifications.set(notifications);
}

export function removeNotification(notification) {
  $notifications.set(
    $notifications.get().filter(n => n.id != notification.id)
  );
}

export function readNotification(notification) {
  $notifications.set(
    $notifications.get().map(n =>
      n.id === notification.id ? Object.assign(n, { read: true }) : n
    )
  );
}
