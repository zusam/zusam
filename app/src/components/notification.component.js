import { h, render, Component, Fragment } from "preact";
import { lang, me, router, util } from "/core";

export default class Notification extends Component {

    constructor(props) {
        super(props);
        this.getMiniatureSrc = this.getMiniatureSrc.bind(this);
        this.setMiniatureOnError = this.setMiniatureOnError.bind(this);
        this.getAction = this.getAction.bind(this);
        this.getTarget = this.getTarget.bind(this);
        this.state = {
            target: this.getTarget(),
            action: this.getAction(),
        };
    }

    getMiniatureSrc() {
        if (this.props.type == "global_notification") {
            return util.defaultAvatar;
        }
        return this.props.fromUser.avatar ? util.crop(this.props.fromUser.avatar["id"], 80, 80) : util.defaultAvatar;
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
            case "global_notification":
                return lang.t("global_notification");
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
                        <strong>{this.props.fromMessage.author["name"]}</strong>
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
                return (
                    <a
                        href={router.toApp("/groups/" + this.props.fromGroup.id)}
                        onClick={e => router.onClick(e)}
                    >
                        {this.props.fromGroup.name}
                    </a>
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
                return "/groups/" + this.props.fromGroup.id;
            case "new_message":
            case "new_comment":
                return "/messages/" + this.props.fromMessage.id;
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
                    me.removeMatchingNotifications(this.props.id).then(_ => router.onClick(e, false, this.state.target));
                }}
            >
                <div class="miniature unselectable">
                    <img
                        src={this.getMiniatureSrc()}
                        onError={e => this.setMiniatureOnError(e)}
                    />
                </div>
                <div class="infos">
                    <div class="description">
                        { this.props.type != "global_notification" && (
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
