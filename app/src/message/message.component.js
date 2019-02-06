import { h, render, Component } from "preact";
import { cache, http, lang, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";
import MessageHead from "./message-head.component.js";
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
        if (!props.message) {
            cache.get(url).then(msg => {
                me.removeNews(msg.id);
                this.setState({
                    message: msg,
                    author: msg.author,
                    displayedChildren: msg.children && 5 // display 5 first children
                });
                setTimeout(this.getPreview);
            });
        } else {
            this.getPreview();
        }
    }

    getPreview() {
        if (this.state.message.data) {
            this.setState({data: this.state.message.data});
            let previewUrl = this.state.message.data["text"].match(/(https?:\/\/[^\s]+)/gi);
            if (previewUrl) {
                cache.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => r && this.setState({preview: r}));
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

    displayMessageText() {
        if (!this.state.data) {
            return "";
        }
        // escape html a little (just enough to avoid injection)
        let txt = this.state.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
        // replace url by real links
        txt = txt.replace(/(https?:\/\/[^\s]+)/ig, match => {
            let url = match;
            if (match && match.length >= 50) {
                url = match.slice(0, 25) + "..." + match.slice(-24);
            }
            return '<a href="' + match + '" target="_blank">' + url + '</a>';
        });
        // replace line returns
        txt = txt.replace(/\n/g, "<br/>");
        return {__html: txt};
    }

    render() {
        if (!this.state.message || !this.state.message.id || this.state.isRemoved) {
            return;
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
                    { this.state.message.children && this.state.message.children.length > 0 && (
                        <div>
                            { this.state.displayedChildren < this.state.message.children.length && (
                                <a class="more-coms" onClick={this.displayMoreChildren}>{lang["more_coms"]}</a>
                            )}
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map((e,i,m) => {
                                let follow = "";
                                if (m[i - 1] && m[i - 1].author.id == e.author.id) {
                                    follow = " follow";
                                }
                                return <Message message={e} key={e.id} follow={follow}/>
                            })}
                        </div>
                    )}
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
                    <div class="message-body">
                        { this.state.message.parent
                                && this.state.author
                                && me.me
                                && this.state.author.id == me.me.id
                                && (
                            <div tabindex="-1"
                                class="options dropdown d-none d-md-flex"
                                onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                onClick={e => e.currentTarget.classList.toggle("active")}
                            >
                                <FaIcon family="solid" icon="caret-down"/>
                                <div class="dropdown-menu">
                                    <a class="seamless-link" onClick={this.editMessage}>{lang["edit"]}</a>
                                    <a class="seamless-link" onClick={this.deleteMessage}>{lang["delete"]}</a>
                                </div>
                            </div>
                        )}
                        { this.state.data && this.state.data.title && (
                            <div class="title">
                                <span>{ this.state.data.title }</span>
                            </div>
                        )}
                        { this.state.data && this.state.data.text && (
                            <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                        )}
                        { this.state.preview && (
                            <p class="text-center card-text">
                                <PreviewBlock
                                    key={this.state.preview.url}
                                    url={this.state.preview.url}
                                    preview={this.state.preview.preview}
                                    data={this.state.preview.data}
                                />
                            </p>
                        )}
                        { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        { this.state.message.parent && (
                            <div class="infos" title={util.humanFullDate(this.state.message.createdAt)}>
                                <span>{ util.humanTime(this.state.message.createdAt) }</span>
                            </div>
                        )}
                    </div>
                </div>
                { !this.state.message.parent && this.state.message.children && this.state.message.children.length > 0 && (
                    <div>
                        { this.state.displayedChildren < this.state.message.children.length && (
                            <a class="more-coms" onClick={this.displayMoreChildren}>{lang["more_coms"]}</a>
                        )}
                        { this.state.message.children.slice(-1 * this.state.displayedChildren).map((e,i,m) => {
                            let follow = "";
                            if (m[i - 1] && m[i - 1].author.id == e.author.id) {
                                follow = " follow";
                            }
                            return <Message message={e} key={e.id} follow={follow}/>
                        })}
                    </div>
                )}
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
