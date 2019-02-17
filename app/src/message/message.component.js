import { h, render, Component } from "preact";
import { cache, http, lang, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";
import MessageHead from "./message-head.component.js";
import MessageBody from "./message-body.component.js";
import MessageChildren from "./message-children.component.js";
import Writer from "./writer.component.js";

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.displayMoreChildren = this.displayMoreChildren.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.onNewChild = this.onNewChild.bind(this);
        this.getPreview = this.getPreview.bind(this);
        if (!props.parent) {
            window.addEventListener("newChild", this.onNewChild);
        }
        let url = router.entityUrl;
        if (!url && props.message) {
            url = "/api/message/" + props.message.id;
        }
        this.state = {
            url: url,
            message: props.message,
            author: props.message ? props.message.author : null,
            preview: null,
            displayedChildren: props.message ? props.message.children && 5 : 0,
        };
    }

    componentDidMount() {
        setTimeout(() => window.scrollTo(0, 0));
    }

    getPreview() {
        if (this.state.message.data) {
            let previewUrl = util.getUrl(this.state.message.data["text"]);
            if (previewUrl) {
                cache.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                    this.setState({
                        preview: r,
                        gotPreview: true,
                        data: this.state.message.data,
                    });
                });
            } else {
                this.setState({
                    gotPreview: true,
                    data: this.state.message.data,
                });
            }
        }
    }

    cancelEdit(event) {
        event.preventDefault();
        this.setState({edit: false});
    }

    deleteMessage(event) {
		event.preventDefault();
        if(confirm(lang["ask_delete_message"])) {
            http.delete(this.state.message["@id"]);
            cache.resetCache();
            // give some time to the cache to delete itself properly
            setTimeout(() => {
                if (this.state.message.parent) {
                    this.setState({isRemoved: true});
                } else {
                    router.navigate(router.toApp(this.state.message.group), {data: {resetGroupDisplay: true}});
                }
            }, 100);
        }
    }

    editMessage(event) {
		event.preventDefault();
        this.setState({edit: true});
    }

    onNewChild(event) {
        const newMsg = event.detail;
        let msg = this.state.message;
        if (newMsg.parent && newMsg.parent == msg["@id"]) {
            newMsg.author = me.me;
            msg.children = [...msg.children, newMsg];
            this.setState({
                displayedChildren: this.state.displayedChildren + 1,
                message: msg
            });
        }
    }

    displayMoreChildren() {
        this.setState({
            displayedChildren: this.state.displayedChildren + 10
        });
    }

    render() {
        if (this.props.hidden) {
            return;
        }
        if (!this.state.message) {
            cache.get(this.state.url).then(msg => {
                me.removeNews(msg.id);
                this.setState({
                    message: msg,
                    author: msg.author,
                    displayedChildren: msg.children && 5 // display 5 first children
                });
            });
        }
        if (!this.state.message || !this.state.message.id || this.state.isRemoved) {
            return;
        }
        if (!this.state.gotPreview) {
            this.getPreview();
        }
        if (this.state.edit) {
            if (this.state.message.parent) {
                return (
                    <div class="message child">
                        { me.me && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ me.me.avatar ? util.crop(me.me.avatar["@id"], 100, 100) : util.defaultAvatar }
                                />
                            </div>
                        )}
                        <Writer
                            messageId={this.state.message.id}
                            files={this.state.message.files}
                            focus={true}
                            group={this.state.group}
                            parent={this.state.message.parent}
                            text={this.state.data.text}
                            cancel={this.cancelEdit}
                        />
                    </div>
                );
            }
            return (
                <div>
                    <Writer
                        messageId={this.state.message.id}
                        files={this.state.message.files}
                        focus={true}
                        group={this.state.group}
                        text={this.state.data.text}
                        title={this.state.data.title}
                        cancel={this.cancelEdit}
                    />
                    <MessageChildren
                        message={this.state.message}
                        displayedChildren={this.state.displayedChildren}
                        displayMoreChildren={this.displayMoreChildren}
                    />
                </div>
            );
        }
        return (
            <div>
                <div className={"message" + (this.state.message.parent ? " child" : "") + (this.props.follow || "")}>
                    <MessageHead
                        author={this.state.author}
                        message={this.state.message}
                        editMessage={this.editMessage}
                        deleteMessage={this.deleteMessage}
                    />
                    <MessageBody
                        author={this.state.author}
                        message={this.state.message}
                        data={this.state.data}
                        preview={this.state.preview}
                        editMessage={this.editMessage}
                        deleteMessage={this.deleteMessage}
                    />
                </div>
                <MessageChildren
                    message={this.state.message}
                    displayedChildren={this.state.displayedChildren}
                    displayMoreChildren={this.displayMoreChildren}
                />
                { !this.state.message.parent && (
                    <div class="message child">
                        { me.me && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ me.me.avatar ? util.crop(me.me.avatar["@id"], 100, 100) : util.defaultAvatar }
                                />
                            </div>
                        )}
                        <Writer
                            parent={this.state.message.id}
                            group={this.state.message.group}
                            focus={false}
                        />
                    </div>
                )}
            </div>
        );
    }
}
