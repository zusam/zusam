import { Fragment, h, render, Component } from "preact";
import { lang, me, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class MessageFooter extends Component {

    render() {
        return (
            <div class="message-footer">
                <div class="infos">
                    { this.props.author && this.props.author.id == me.me.id && (
                        <Fragment>
                            <a class="action seamless-link font-size-90" onClick={this.props.editMessage}>{lang.t("edit")}</a>
                            <div class="dot">&bull;</div>
                        </Fragment>
                    )}
                    { this.props.author && this.props.author.id == me.me.id && (
                        <Fragment>
                            <a class="action seamless-link font-size-90" onClick={this.props.deleteMessage}>{lang.t("delete")}</a>
                            <div class="dot">&bull;</div>
                        </Fragment>
                    )}
                    <div class="date font-size-90" title={util.humanFullDate(this.props.message.createdAt)}>
                        { util.humanTime(this.props.message.createdAt) }
                    </div>
                </div>
                <div>
                    { !this.props.isPublic && !this.props.isChild && (
                        <div
                            class="options dropdown"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <FaIcon family="solid" icon="ellipsis-h"/>
                            <div class="dropdown-menu dropdown-options">
                                <a class="seamless-link" onClick={this.props.openPublicLink}>{lang.t("public_link")}</a>
                                { me.me.groups.length > 1 && (
                                    <a class="seamless-link" onClick={this.props.shareMessage}>{lang.t("share_message")}</a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
