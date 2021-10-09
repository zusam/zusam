import { h, Component, Fragment } from "preact";
import { http, util, cache } from "/src/core";
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
      group: null,
      user: null,
      message: null,
    };
  }

  componentDidMount() {
    cache.fetch(`/api/notifications/${this.props.id}`).then(n => {
      Promise.all([
        `/api/groups/${n.fromGroup.id}`,
        `/api/users/${n.fromUser.id}`,
        `/api/messages/${n.fromMessage.id}`,
      ].map(url => cache.fetch(url).then(e => e))).then(res => {
        this.setState({
          target: this.getTarget(n, res[0], res[2]),
          action: this.getAction(n),
          title: this.getTitle(n, res[2]),
          notification: n,
          group: res[0],
          user: res[1],
          message: res[2],
        });
      });
    });
  }

  getMiniature(notification, user) {
    let imgSrc = util.defaultAvatar;
    if (
      user &&
      user.avatar &&
      notification.type != "global_notification"
    ) {
      imgSrc = util.crop(user.avatar["id"], 80, 80);
    }
    return (
      <img
        style={util.backgroundHash(
          user ? user.id : ""
        )}
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

  getTitle(notification, message) {
    switch (notification?.type) {
      case "new_message":
      case "new_comment":
        if (message && message['data']) {
          if (message['data']['title']) {
            return message['data']['title'];
          }
          if (message['data']['text']) {
            let url = util.getUrl(message['data']['text']);
            if (url && url.length > 0) {
              url = url[0];
            }
            if (url) {
              http.get(`/api/links/by_url?url=${encodeURIComponent(url)}`).then(r => {
                this.setState({title: r?.data?.title || r?.data?.description || r?.data?.url});
              });
              return url;
            }
            return message['data']['text'];
          }
        }
        return "";
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
              {this.state?.group.name}
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
            <strong>
              {this.state.message && this.state.message["author"]
                ? this.state.message["author"]["name"]
                : ""}
            </strong>
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
            {this.state?.group.name}
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

  getTarget(notification, group, message) {
    switch (notification?.type) {
      case "user_joined_group":
      case "user_left_group":
      case "group_name_change":
        return `/groups/${group.id}`;
      case "new_message":
        return `/messages/${notification.target}`;
      case "new_comment":
        return (
          `/messages/${message.id}/${notification.target}`
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
        <div class="miniature unselectable">{this.getMiniature(this.state.notification, this.state.user)}</div>
        <div class="infos">
          <div class="description">
            {this.state.notification.type != "global_notification" && (
              <Fragment>
                <strong>{this.state.user.name || "--"}</strong>
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
