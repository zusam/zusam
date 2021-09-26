import { h } from "preact";
import { me } from "/src/core";
import { FaIcon } from "/src/misc";
import { Notification } from "/src/pages";
import { useStoreon } from 'storeon/preact'
import { useTranslation } from "react-i18next";

export default function NotificationsDropdownNavbar() {

  // TODO remove dispatch
  const { dispatch, notifications } = useStoreon('notifications');
  if (!notifications) {
    return null;
  }
  const { t } = useTranslation();

  return (
    <div
      className={
        `menu dropdown${notifications.length ? " cursor-pointer" : ""}`
      }
      title={t('notifications')}
      tabindex="-1"
      onClick={e =>
        notifications.length &&
        e.currentTarget.classList.toggle("active")
      }
    >
      <div class="unselectable button-with-count">
        <FaIcon
          family={notifications.length ? "solid" : "regular"}
          icon={"bell"}
        />
        {!!notifications.length && (
          <span class="badge-count">{Math.min(notifications.length, 99) + (notifications.length > 99 ? "+" : "")}</span>
        )}
      </div>
      <div class="dropdown-menu dropdown-right notifications-menu">
        <div class="notification-header">
          <strong class="capitalize">{t("notifications")}</strong>
          <div
            class="action capitalize"
            onClick={() => me.removeAllNotifications()}
          >
            {t("mark_all_as_read")}
          </div>
        </div>
        {notifications?.length && (
          notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0,99).map(e => <Notification key={e.id} {...e} />)
        )}
      </div>
    </div>
  );
}
