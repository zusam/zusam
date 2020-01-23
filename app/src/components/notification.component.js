import { h, render, Component, Fragment } from "preact";
import { lang, me, router, util } from "/core";

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.getMiniature = this.getMiniature.bind(this);
    this.setMiniatureOnError = this.setMiniatureOnError.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getTarget = this.getTarget.bind(this);
    this.state = {
      target: this.getTarget(),
      action: this.getAction()
    };
  }

  getMiniature() {
    let imgSrc = util.defaultAvatar;
    if (
      this.props.fromUser.avatar &&
      this.props.type != "global_notification"
    ) {
      imgSrc = util.crop(this.props.fromUser.avatar["id"], 80, 80);
    }
    return (
      <img
        style={"background-color:#" + util.colorHash(this.props.fromUser.id)}
        src={imgSrc}
        onError={e => this.setMiniatureOnError(e)}
      />
    );
  }

  setMiniatureOnError(event) {
    event.currentTarget.src = util.defaultAvatar;
  }

  getAction() {
    switch (this.props.type) {
      case "new_message":
        return lang.t("has_posted_in");
      case "new_comment":
        return lang.t("has_commented_on");
      case "user_joined_group":
        return lang.t("has_joined");
      case "user_left_group":
        return lang.t("has_left");
      case "group_name_change":
        return lang.t("changed_group_name");
      default:
        return "";
    }
  }

  getObject() {
    switch (this.props.type) {
      case "new_message":
        return (
          <a
            href={router.toApp("/groups/" + this.props.fromGroup.id)}
            onClick={e => router.onClick(e)}
          >
            {this.props.fromGroup.name}
          </a>
        );
      case "new_comment":
        return (
          <span>
            {lang.t("the_message_from") + " "}
            <strong>
              {this.props.fromMessage && this.props.fromMessage["author"]
                ? this.props.fromMessage["author"]["name"]
                : ""}
            </strong>
            {" " + lang.t("in") + " "}
            <a
              href={router.toApp("/groups/" + this.props.fromGroup.id)}
              onClick={e => router.onClick(e)}
            >
              {this.props.fromGroup.name}
            </a>
          </span>
        );
      case "user_joined_group":
      case "user_left_group":
        return (
          <a
            href={router.toApp("/groups/" + this.props.fromGroup.id)}
            onClick={e => router.onClick(e)}
          >
            {this.props.fromGroup.name}
          </a>
        );
      case "group_name_change":
        return (
          <span>
            <strong>{this.props.data["previousGroupName"]}</strong>
            {" " + lang.t("to") + " "}
            <strong>{this.props.data["newGroupName"]}</strong>
          </span>
        );
      case "global_notification":
        return this.props.data["text"];
      default:
        return "";
    }
  }

  getTarget() {
    switch (this.props.type) {
      case "user_joined_group":
      case "user_left_group":
      case "group_name_change":
        return "/groups/" + this.props.fromGroup.id;
      case "new_message":
        return "/messages/" + this.props.target;
      case "new_comment":
        return (
          "/messages/" + this.props.fromMessage.id + "/" + this.props.target
        );
      case "global_notification":
        return this.props.target;
      default:
        return "";
    }
  }

  render() {
    return (
      <a
        class="notification seamless-link unselectable"
        href={router.toApp(this.state.target)}
        onClick={e => {
          e.preventDefault();
          me.removeMatchingNotifications(this.props.id).then(_ =>
            router.onClick(e, false, this.state.target)
          );
        }}
      >
        <div class="miniature unselectable">{this.getMiniature()}</div>
        <div class="infos">
          <div class="description">
            {this.props.type != "global_notification" && (
              <Fragment>
                <strong>{this.props.fromUser.name}</strong>
                <span>{" " + this.state.action + " "}</span>
              </Fragment>
            )}
            {this.getObject()}
          </div>
          <div class="date" title={util.humanFullDate(this.props.createdAt)}>
            {util.humanTime(this.props.createdAt)}
          </div>
        </div>
      </a>
    );
  }
}
