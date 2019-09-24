import { Fragment, h, render, Component } from "preact";
import { Suspense, lazy } from "preact/compat";
import { lang, cache, http, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";
import MessageHead from "./message-head.component.js";
import MessageFooter from "./message-footer.component.js";
import MessageBody from "./message-body.component.js";
import MessageChildren from "./message-children.component.js";

const Writer = lazy(() => import("/message/writer.component.js"));

export default class MessageChild extends Component {

    constructor(props) {
        super(props);
        this.loadMessage = this.loadMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.shareMessage = this.shareMessage.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.onEditMessage = this.onEditMessage.bind(this);
        this.processEmbed = this.processEmbed.bind(this);
        this.publishInGroup = this.publishInGroup.bind(this);

        window.addEventListener("editMessage", this.onEditMessage);

        let url = router.entityUrl;
        if (!url && props.message) {
            url = "/api/message/" + props.message.id;
        }

        this.state = {url: url, preview: null};

        if (props.message) {
            this.loadMessage(props.message);
        } else {
            cache.get(url).then(msg => this.loadMessage(msg));
        }
    }

    loadMessage(msg) {
        me.removeMatchingNotifications(msg.id);
        this.setState({
            message: msg,
            author: msg.author,
            displayedChildren: msg.children && 5, // display 5 first children
        });
        setTimeout(this.processEmbed);
    }

    cancelEdit(event) {
        event.preventDefault();
        this.setState({edit: false});
    }

    deleteMessage(event) {
        event.preventDefault();
        if(confirm(lang.t("ask_delete_message"))) {
            http.delete("/api/messages/" + this.state.message["id"]);
            cache.resetCache();
            // give some time to the cache to delete itself properly
            setTimeout(() => this.setState({isRemoved: true}), 100);
        }
    }

    publishInGroup() {
        http.put("/api/messages/" + this.state.message.id, {isInFront: true}).then(res => {
            if (!res) {
                alert.add(lang.t("error"), "alert-danger");
                return;
            }
            router.navigate("/groups/" + this.state.message.group.id);
        });
    }

    shareMessage(event) {
        event.preventDefault();
        router.navigate("/share?message=" + this.state.message.id);
    }

    editMessage(event) {
        event.preventDefault();
        this.setState({edit: true});
    }

    onEditMessage(event) {
        if (event.detail.id == this.state.message.id) {
            this.props.key = +Date.now();
            let msg = this.state.message;
            msg.data = event.detail.data;
            msg.files = event.detail.files;
            this.setState({
                message: msg,
                data: msg.data,
                gotPreview: false,
            });
            setTimeout(_ => this.setState({edit: false}));
        }
    }

    displayWriter(isChild) {
        return (
            <Suspense fallback={<br/>}>
                <Writer
                    cancel={this.state.edit ? this.cancelEdit : null}
                    files={this.state.edit ? this.state.message.files : []}
                    focus={!!this.state.edit}
                    group={this.state.message.group}
                    messageId={this.state.edit ? this.state.message.id : null}
                    parent={this.state.edit ? this.state.message["parent"] : this.state.message.id}
                    text={this.state.edit ? this.state.message.data["text"] : ""}
                    title={this.state.edit ? this.state.message.data["title"] : ""}
                    mode={this.state.edit ? this.state.message.data["type"] : "plain"}
                    isChild={isChild}
                />
            </Suspense>
        );
    }

    componentDidMount() {
        setTimeout(() => window.scrollTo(0, 0));
    }

    processEmbed() {
        if (this.state.message && this.state.message.data) {
            let previewUrl = util.getUrl(this.state.message.data["text"]);
            if (previewUrl) {
                cache.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                    this.setState({preview: r, gotPreview: true});
                });
            } else {
                this.setState({gotPreview: true});
            }
        }
    }

    componentWillUpdate() {
        if (!this.state.gotPreview) {
            this.processEmbed();
        }
    }

    render() {
        if (this.props.hidden || !this.state.message || this.state.isRemoved) {
            return;
        }
        return (
            <div>
                <div class="message child">
                    { this.state.edit && me.me && (
                        <div class="message-head p-1 d-none d-md-block">
                            <img
                                class="rounded-circle w-3 material-shadow avatar"
                                src={ me.me.avatar ? util.crop(me.me.avatar["id"], 100, 100) : util.defaultAvatar }
                            />
                        </div>
                    )}
                    { this.state.edit && this.displayWriter(true) }
                    { !this.state.edit && (
                        <Fragment>
                            <MessageHead
                                author={this.state.author}
                                message={this.state.message}
                                isPublic={this.props.isPublic}
                                isChild={true}
                            />
                            <div class="main">
                                <MessageBody
                                    message={this.state.message}
                                    isPublic={this.props.isPublic}
                                    isChild={true}
                                />
                                <MessageFooter
                                    author={this.state.author}
                                    message={this.state.message}
                                    editMessage={this.editMessage}
                                    deleteMessage={this.deleteMessage}
                                    shareMessage={this.shareMessage}
                                    publishInGroup={this.publishInGroup}
                                    isPublic={this.props.isPublic}
                                    isChild={true}
                                />
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
        );
    }
}
