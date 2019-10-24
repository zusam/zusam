import { h, render, Component } from "preact";
import { lang, me, router, util } from "/core";

export default class Notification extends Component {

    constructor(props) {
        super(props);
        this.getMiniatureSrc = this.getMiniatureSrc.bind(this);
        this.setMiniatureOnError = this.setMiniatureOnError.bind(this);
        this.getAction = this.getAction.bind(this);
        this.getTarget = this.getTarget.bind(this);
    }

    getMiniatureSrc() {
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
            default:
                return "";
        }
    }

    getObject() {
        switch (this.props.type) {
            case "new_message":
                return <a href={"/groups/" + this.props.fromGroup.id} onClick={router.onClick}>{this.props.fromGroup.name}</a>;
            case "new_comment":
                return (
                    <span>
                        {lang.t("the_message_from") + " "}
                        <strong>{this.props.fromMessage.author["name"]}</strong>
                        {" " + lang.t("in") + " "}
                        <a href={"/groups/" + this.props.fromGroup.id} onClick={router.onClick}>{this.props.fromGroup.name}</a>
                    </span>
                );
            case "user_joined_group":
                return <a href={"/groups/" + this.props.fromGroup.id} onClick={router.onClick}>{this.props.fromGroup.name}</a>;
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
            default:
                return "";
        }
    }

    render() {
        return (
            <a class="notification seamless-link unselectable" href={this.getTarget()} onClick={router.onClick}>
                <div class="miniature unselectable">
                    <img
                        src={this.getMiniatureSrc()}
                        onError={this.setMiniatureOnError}
                    />
                </div>
                <div class="infos">
                    <div class="description">
                        <strong>{this.props.fromUser.name}</strong>
                        <span>{" " + this.getAction() + " "}</span>
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
