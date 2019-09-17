import { h, render, Component } from "preact";
import { Suspense, lazy } from "preact/compat";
import { lang, cache, http, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";
import MessageHead from "./message-head.component.js";
import MessageBody from "./message-body.component.js";
import MessageChildren from "./message-children.component.js";

const Writer = lazy(() => import("/message/writer.component.js"));

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.loadMessage = this.loadMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.shareMessage = this.shareMessage.bind(this);
        this.openPublicLink = this.openPublicLink.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.onNewChild = this.onNewChild.bind(this);
        this.onEditMessage = this.onEditMessage.bind(this);
        if (!props.parent) {
            window.addEventListener("newChild", this.onNewChild);
        }
        window.addEventListener("editMessage", this.onEditMessage);
        let url = router.entityUrl;
        if (!url && props.message) {
            url = "/api/message/" + props.message.id;
        }

        this.state = {
            url: url,
            preview: null,
        };

        if (props.message) {
            this.loadMessage(props.message);
        }
    }

    componentDidMount() {
        setTimeout(() => window.scrollTo(0, 0));
    }

    loadMessage(msg) {
        me.removeMatchingNotifications(msg.id);
        this.setState({
            message: msg,
            author: msg.author,
            displayedChildren: msg.children && 5, // display 5 first children
        });
    }

    cancelEdit(event) {
        event.preventDefault();
        this.setState({edit: false});
    }

    async openPublicLink(event) {
        event.preventDefault();
        let newTab = window.open("about:blank", "_blank");
        const res = await http.get("/api/messages/" + this.state.message["id"] + "/get-public-link");
        newTab.location = window.origin + "/public/" + res.token;
    };

    deleteMessage(event) {
        event.preventDefault();
        if(confirm(lang.t("ask_delete_message"))) {
            http.delete("/api/messages/" + this.state.message["id"]);
            cache.resetCache();
            // give some time to the cache to delete itself properly
            setTimeout(() => {
                if (this.state.message.parent) {
                    this.setState({isRemoved: true});
                } else {
                    router.navigate("/groups/" + this.state.message.group.id, {data: {resetGroupDisplay: true}});
                }
            }, 100);
        }
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
            });
            setTimeout(_ => this.setState({edit: false}));
        }
    }

    onNewChild(event) {
        const newMsg = event.detail;
        let msg = this.state.message;
        if (newMsg.parent && util.getId(newMsg.parent) == msg["id"]) {
            newMsg.author = me.me;
            msg.children = [...msg.children, newMsg];
            this.setState(prevState => ({
                displayedChildren: prevState.displayedChildren + 1,
                message: msg,
            }));
        }
    }

    displayWriter() {
        return (
            <Suspense fallback={<br/>}>
                <Writer
                    cancel={this.state.edit ? this.cancelEdit : null}
                    files={this.state.edit ? this.state.message.files : []}
                    focus={!!this.state.edit}
                    group={this.state.message.group}
                    messageId={this.state.edit ? this.state.message.id : null}
                    parent={this.state.edit ? this.state.message["parent"] : this.state.message.id}
                    text={this.state.edit ? this.state.data.text : ""}
                    title={this.state.edit ? this.state.data["title"] : ""}
                />
            </Suspense>
        );
    }

    render() {
        if (this.props.hidden) {
            return;
        }
        if (!this.state.message) {
            cache.get(this.state.url).then(msg => this.loadMessage(msg));
        }
        if (!this.state.message || !this.state.message.id || this.state.isRemoved) {
            return;
        }
        if (!this.state.gotPreview) {
            if (this.state.message.data) {
                let previewUrl = util.getUrl(this.state.message.data["text"]);
                if (previewUrl) {
                    cache.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                        this.setState(prevState => ({
                            preview: r,
                            gotPreview: true,
                            data: prevState.message.data,
                        }));
                    });
                } else {
                    this.setState(prevState => ({
                        gotPreview: true,
                        data: prevState.message.data,
                    }));
                }
            }
        }
        return (
            <div>
                <div className={"message" + (this.state.message.parent ? " child" : "") + (this.props.follow || "")}>
                    { this.state.edit && this.state.message.parent && me.me && (
                        <div class="message-head p-1 d-none d-md-block">
                            <img
                                class="rounded-circle w-3 material-shadow avatar"
                                src={ me.me.avatar ? util.crop(me.me.avatar["id"], 100, 100) : util.defaultAvatar }
                            />
                        </div>
                    )}
                    { this.state.edit && this.displayWriter() }
                    { !this.state.edit && (
                        <MessageHead
                            author={this.state.author}
                            message={this.state.message}
                            editMessage={this.editMessage}
                            deleteMessage={this.deleteMessage}
                            openPublicLink={this.openPublicLink}
                            shareMessage={this.shareMessage}
                            isPublic={this.props.isPublic}
                        />
                    )}
                    { !this.state.edit && (
                        <MessageBody
                            author={this.state.author}
                            message={this.state.message}
                            data={this.state.data}
                            preview={this.state.preview}
                            editMessage={this.editMessage}
                            deleteMessage={this.deleteMessage}
                            openPublicLink={this.openPublicLink}
                            shareMessage={this.shareMessage}
                            isPublic={this.props.isPublic}
                        />
                    )}
                </div>
                { !this.state.message.parent && (
                    <MessageChildren
                        children={this.state.message.children}
                        displayedChildren={this.state.displayedChildren}
                        displayMoreChildren={_ => this.setState(prevState => ({displayedChildren: prevState.displayedChildren + 10}))}
                        isPublic={this.props.isPublic}
                        key={this.state.message.id}
                    />
                )}
                { !this.state.edit && !this.props.isPublic && !this.state.message.parent && (
                    <div class="message child">
                        { me.me && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ me.me.avatar ? util.crop(me.me.avatar["id"], 100, 100) : util.defaultAvatar }
                                />
                            </div>
                        )}
                        { this.displayWriter() }
                    </div>
                )}
            </div>
        );
    }
}
