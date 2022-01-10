import { h, Component, Fragment } from "preact";
import { http, util } from "/src/core";
import { Link } from "react-router-dom";
import { withTranslation } from 'react-i18next';

class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: null,
      action: null,
      title: null,
      notification: null,
    };
  }

  componentDidMount() {
    http.get(`/api/notifications/${this.props.id}`, false, 100).then(n => {
      this.setState({
        target: this.getTarget(n, n.fromMessage.id),
        action: this.getAction(n),
        title: n.title,
        notification: n,
      });
    });
  }

  getMiniature(notification) {
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
        onError={e => this.setMiniatureOnError(e)}
      />
    );
  }

  setMiniatureOnError(event) {
    event.currentTarget.src = util.defaultAvatar;
  }

  getAction(notification) {
    switch (notification?.type) {
      case "new_message":
        return this.props.t("has_posted_in");
      case "new_comment":
        return this.props.t("has_commented_on");
      case "user_joined_group":
        return this.props.t("has_joined");
      case "user_left_group":
        return this.props.t("has_left");
      case "group_name_change":
        return this.props.t("changed_group_name");
      default:
        return "";
    }
  }

  getObject(notification) {
    switch (notification?.type) {
      case "new_message":
        return (
          <Fragment>
            <strong>
              {this.state?.notification?.fromGroup.name}
            </strong>
            {this.state.title && (
              <Fragment>
                <br />
                <small><em>{util.limitStrSize(this.state.title, 52)}</em></small>
              </Fragment>
            )}
          </Fragment>
        );
      case "new_comment":
        return (
          <span>
            {`${this.props.t("the_message_from")  } `}
            <strong>{notification?.parentAuthorName}</strong>
            {this.state.title && (
              <Fragment>
                <br />
                <small><em>{util.limitStrSize(this.state.title, 52)}</em></small>
              </Fragment>
            )}
          </span>
        );
      case "user_joined_group":
      case "user_left_group":
        return (
          <strong>
            {this.state?.notification?.fromGroup.name}
          </strong>
        );
      case "group_name_change":
        return (
          <span>
            <strong>{this.state.notification.data["previousGroupName"]}</strong>
            {` ${this.props.t("to")} `}
            <strong>{this.state.notification.data["newGroupName"]}</strong>
          </span>
        );
      case "global_notification":
        return this.state.notification.data["text"];
      default:
        return "";
    }
  }

  getTarget(notification, message_id) {
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
  }

  render() {
    if (!this.state?.notification) {
      return null;
    }
    return (
      <Link
        class="notification seamless-link unselectable"
        to={this.state.target}
        title={this.state.title}
      >
        <div class="miniature unselectable">{this.getMiniature(this.state.notification)}</div>
        <div class="infos">
          <div class="description">
            {this.state.notification.type != "global_notification" && (
              <Fragment>
                <strong>{this.state.notification?.author?.name || "--"}</strong>
                <span>{` ${this.state.action} `}</span>
              </Fragment>
            )}
            {this.getObject(this.state.notification)}
          </div>
          <div class="date">
            {util.humanTime(this.state.notification.createdAt)}
          </div>
        </div>
      </Link>
    );
  }
}

export default withTranslation()(Notification);
