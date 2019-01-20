import { h, render, Component } from "preact";
import lang from "./lang.js";
import util from "./util.js";
import FaIcon from "./fa-icon.component.js";

export default class MessageHead extends Component {

    render() {
        return (
            <div class="message-head d-flex">
                { this.props.author && (
                    <img
                        class="rounded-circle material-shadow avatar"
                        src={ this.props.author.avatar ? util.crop(this.props.author.avatar["@id"], 100, 100) : util.defaultAvatar }
                        title={ this.props.author.name }
                    />
                )}
                <div class="infos">
                    { this.props.author && <span class="capitalize author">{ this.props.author.name }</span> }
                    <span title={util.humanFullDate(this.props.message.createdAt)}>{ util.humanTime(this.props.message.createdAt) }</span>
                </div>
                { this.props.currentUser && this.props.author && this.props.author.id == this.props.currentUser.id && (
                    <div tabindex="-1"
                        class="options dropdown"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                        <FaIcon family="solid" icon="caret-down"/>
                        <div class="dropdown-menu">
                            <a class="seamless-link" onClick={this.props.editMessage}>{lang.fr["edit"]}</a>
                            <a class="seamless-link" onClick={this.props.deleteMessage}>{lang.fr["delete"]}</a>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
