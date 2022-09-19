import { h, Fragment } from "preact";
import { http, util, notifications } from "/src/core";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaIcon } from "/src/misc";

export default function Notification(props) {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [target, setTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [title, setTitle] = useState(null);
  const [notification, setNotification] = useState(null);

  const getMiniature = (notification) => {
    let imgSrc = util.defaultAvatar;
    if (
      notification?.miniature
      && notification.type != "global_notification"
    ) {
      imgSrc = util.crop(notification?.miniature?.id, 80, 80);
    }
    return (
      <img
        style={util.backgroundHash(notification?.author?.id)}
        src={imgSrc}
        onError={e => setMiniatureOnError(e)}
      />
    );
  };

  const setMiniatureOnError = (event) => {
    event.currentTarget.src = util.defaultAvatar;
  };

  const getAction = (notification) => {
    switch (notification?.type) {
    case "new_message":
      return t("has_posted_in");
    case "new_comment":
      return t("has_commented_on");
    case "user_joined_group":
      return t("has_joined");
    case "user_left_group":
      return t("has_left");
    case "group_name_change":
      return t("changed_group_name");
    default:
      return "";
    }
  };

  const getObject = (notification) => {
    switch (notification?.type) {
    case "new_message":
      return (
        <Fragment>
          <strong>
            {notification?.fromGroup.name}
          </strong>
          {title && (
            <Fragment>
              <br />
              <small><em>{util.limitStrSize(title, 50)}</em></small>
            </Fragment>
          )}
        </Fragment>
      );
    case "new_comment":
      return (
        <span>
          {`${t("the_message_from")  } `}
          <strong>{notification?.parentAuthorName}</strong>
          {title && (
            <Fragment>
              <br />
              <small><em>{util.limitStrSize(title, 50)}</em></small>
            </Fragment>
          )}
        </span>
      );
    case "user_joined_group":
    case "user_left_group":
      return (
        <strong>
          {notification?.fromGroup.name}
        </strong>
      );
    case "group_name_change":
      return (
        <span>
          <strong>{notification.data["previousGroupName"]}</strong>
          {` ${t("to")} `}
          <strong>{notification.data["newGroupName"]}</strong>
        </span>
      );
    case "global_notification":
      return notification.data["text"];
    default:
      return "";
    }
  };

  const getTarget = (notification, message_id) => {
    switch (notification?.type) {
    case "user_joined_group":
    case "user_left_group":
    case "group_name_change":
      return `/groups/${notification.fromGroup.id}`;
    case "new_message":
      return `/messages/${notification.target}`;
    case "new_comment":
      return (
        `/messages/${message_id}/${notification.target}`
      );
    case "global_notification":
      return notification.target;
    default:
      return "";
    }
  };

  const onClick = (event, target) => {
    event.preventDefault();
    notifications.markAsRead(props.id).then(() => {
      navigate(target);
    });
  };

  useEffect(() => {
    http.get(`/api/notifications/${props.id}`, false, 100).then(n => {
      setTarget(getTarget(n, n.fromMessage?.id));
      setAction(getAction(n));
      setTitle(n.title);
      setNotification(n);
    });
  }, []);

  if (!notification) {
    return null;
  }
  return (
    <a
      class="notification seamless-link unselectable"
      href={target}
      title={title}
      onClick={e => onClick(e, target)}
    >
      <div class="miniature unselectable">{getMiniature(notification)}</div>
      <div class="infos">
        <div class="description">
          {notification.type != "global_notification" && (
            <Fragment>
              <strong>{notification?.author?.name || "--"}</strong>
              <span>{` ${action} `}</span>
            </Fragment>
          )}
          {getObject(notification)}
        </div>
        <div class="date">
          {util.humanTime(notification.createdAt)}
        </div>
        { !notification.read && (
          <div class="unread-dot" />
        )}
      </div>
      <div
        class="options dropdown"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          e?.target?.closest(".dropdown")?.classList.toggle("active");
        }}
      >
        <div class="none-if-follows-empty">
          <FaIcon family="solid" icon="ellipsis-h" />
        </div>
        <div class="dropdown-menu dropdown-options">
            <a
              class="seamless-link capitalize"
              onClick={e => notifications.removeMatchingNotifications(notification.id)}
            >
              {t("delete")}
            </a>
        </div>
      </div>
    </a>
  );
}
