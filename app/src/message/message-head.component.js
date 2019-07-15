import { h, render, Component } from "preact";
import { me, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class MessageHead extends Component {

    render() {
        return (
            <div class="message-head d-flex" id={this.props.message.id}>
                <div>
                    <img
                        className={"rounded-circle material-shadow avatar" + (this.props.author ? "" : " removed-user")}
                        src={
                            this.props.author && this.props.author.avatar ?
                                util.crop(this.props.author.avatar.id, 100, 100)
                                : util.defaultAvatar
                        }
                        title={ this.props.author ? this.props.author.name : ""}
                    />
                </div>
                <div class="infos">
                    <span class="capitalize author">{this.props.author ? this.props.author.name : "--"}</span>
                    <span title={util.humanFullDate(this.props.message.createdAt)}>{ util.humanTime(this.props.message.createdAt) }</span>
                </div>
                { !this.props.isPublic && (
                    <div tabindex="-1"
                        class="options dropdown"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                        <FaIcon family="solid" icon="caret-down"/>
                        <div class="dropdown-menu">
                            { this.props.author && this.props.author.id == me.me.id && (
                                <a class="seamless-link" onClick={this.props.editMessage}>{lang["edit"]}</a>
                            )}
                            { this.props.author && this.props.author.id == me.me.id && (
                                <a class="seamless-link" onClick={this.props.deleteMessage}>{lang["delete"]}</a>
                            )}
                            { !this.props.message.parent && (
                                <a class="seamless-link" onClick={this.props.openPublicLink}>{lang["public_link"]}</a>
                            )}
                            { !this.props.message.parent && (
                                <a class="seamless-link" onClick={this.props.shareMessage}>{lang["share_message"]}</a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
