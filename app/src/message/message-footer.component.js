import { Fragment, h, render, Component } from "preact";
import { router, lang, me, util } from "/core";
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
                    { !this.props.isPublic && this.props.isChild && (
                        <Fragment>
                            <a
                                class="action seamless-link font-size-90"
                                href={"/messages/" + this.props.message.id + (this.props.message.children.length ? "" : "?focus=reply")}
                                onClick={router.onClick}
                            >
                                {this.props.message.children.length ?
                                        lang.t("replies", {count:this.props.message.children.length})
                                        : lang.t("reply")
                                }
                            </a>
                            <div class="dot">&bull;</div>
                        </Fragment>
                    )}
                    <div class="date font-size-90" title={util.humanFullDate(this.props.message.createdAt)}>
                        { util.humanTime(this.props.message.createdAt) }
                    </div>
                    { this.props.author && (
                        <Fragment>
                            <div class="dot">&bull;</div>
                            <div class="font-size-90">{this.props.author.name}</div>
                        </Fragment>
                    )}
                </div>
                <div>
                    { !this.props.isPublic && (
                        <div
                            class="options dropdown"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class="dropdown-menu dropdown-options">
                                { !this.props.isChild && (
                                    <a class="seamless-link capitalize" onClick={this.props.openPublicLink}>{lang.t("public_link")}</a>
                                )}
                                { !this.props.isChild && me.me.groups.length > 1 && (
                                    <a class="seamless-link capitalize" onClick={this.props.shareMessage}>{lang.t("share_message")}</a>
                                )}
                                { !this.props.message.isInFront && this.props.author.id == me.me.id && (
                                    <a class="seamless-link capitalize" onClick={this.props.publishInGroup}>{lang.t("publish_in_group")}</a>
                                )}
                            </div>
                            <div class="none-if-follows-empty">
                                <FaIcon family="solid" icon="ellipsis-h"/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
