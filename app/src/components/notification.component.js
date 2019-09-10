import { h, render, Component } from "preact";
import { me, router, util } from "/core";

export default class Notification extends Component {

    constructor(props) {
        super(props);
        this.getMiniatureSrc = this.getMiniatureSrc.bind(this);
        this.setMiniatureOnError = this.setMiniatureOnError.bind(this);
        this.getAction = this.getAction.bind(this);
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
                return lang["has_posted_in"];
            case "new_comment":
                return lang["has_commented_on"];
            case "user_joined_group":
                return lang["has_joined"];
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
                        {lang["the_message_from"] + " "}
                        <strong>{this.props.fromMessage.author["name"]}</strong>
                        {" " + lang["in"] + " "}
                        <a href={"/groups/" + this.props.fromGroup.id} onClick={router.onClick}>{this.props.fromGroup.name}</a>
                    </span>
                );
            case "user_joined_group":
                return lang["has_joined"];
            default:
                return "";
        }
    }

    render() {
        return (
            <a class="notification seamless-link unselectable" href={"/messages/" + this.props.fromMessage.id} onClick={router.onClick}>
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
