import { h, render, Component } from "preact";
import lang from "./lang.js";
import util from "./util.js";
import bee from "./bee.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";
import Writer from "./writer.component.js";
import FaIcon from "./fa-icon.component.js";
import router from "./router.js";

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.displayMoreChildren = this.displayMoreChildren.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.onNewChild = this.onNewChild.bind(this);
        this.getPreview = this.getPreview.bind(this);
        if (!props.parent) {
            window.addEventListener("newChild", this.onNewChild);
        }
        this.state = {
            url: props.url,
            message: props.message,
            author: props.message ? props.message.author : null,
            preview: null,
            displayedChildren: props.message ? props.message.children && 5 : 0,
        };
        if (!props.message) {
            bee.get(props.url).then(msg => {
                this.setState({
                    message: msg,
                    author: msg.author,
                    displayedChildren: msg.children && 5 // display 5 first children
                });
                setTimeout(this.getPreview);
                bee.set("message_" + msg.id, {timestamp: Date.now()});
            });
        } else {
            this.getPreview();
            bee.set("message_" + this.state.message.id, {timestamp: Date.now()});
        }
    }

    componentDidMount() {
        setTimeout(() => window.scrollTo(0, 0), 0);
    }

    getPreview() {
        if (this.state.message.data) {
            const data = JSON.parse(this.state.message.data);
            this.setState({data: data});
            let previewUrl = data["text"].match(/(https?:\/\/[^\s]+)/gi);
            if (previewUrl) {
                bee.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => r && this.setState({preview: r}));
            }
        }
    }

    deleteMessage(event) {
		event.preventDefault();
        if(confirm(lang.fr["ask_delete_message"])) {
            bee.http.delete(this.state.message["@id"]);
            bee.resetCache();
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
            newMsg.author = this.props.currentUser;
            msg.children = [...msg.children, newMsg];
            this.setState({
                displayedChildren: this.state.displayedChildren + 1,
                message: msg
            });
        }
    }

    displayMoreChildren() {
        this.setState({
            displayedChildren: this.state.displayedChildren + 5
        });
    }

    shortenUrl(url) {
        if (!url || url.length < 50) {
            return url;
        }
        return url.slice(0, 25) + "..." + url.slice(-24);
    }

    displayMessageText() {
        if (!this.state.data) {
            return "";
        }
        // escape html a little (just enough to avoid injection)
        let txt = this.state.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
        let matches = txt.match(/(https?:\/\/[^\s]+)/gi);
        if (matches) {
            matches.forEach(url => {
                txt = txt.replace(url, "<a href=\"" + url + "\">" + this.shortenUrl(url) + "</a>");
            });
        }
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
                        { this.props.currentUser && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ this.props.currentUser.avatar ? bee.crop(this.props.currentUser.avatar["@id"], 100, 100) : util.defaultAvatar }
                                />
                            </div>
                        )}
                        <Writer
                            messageId={this.state.message.id}
                            files={this.state.message.files}
                            focus={true}
                            currentUser={this.state.currentUser}
                            group={this.state.group}
                            parent={this.state.message.parent}
                            text={this.state.data.text}
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
                        currentUser={this.state.currentUser}
                        group={this.state.group}
                        text={this.state.data.text}
                        title={this.state.data.title}
                    />
                    { this.state.message.children && this.state.message.children.length > 0 && (
                        <div>
                            { this.state.displayedChildren < this.state.message.children.length && (
                                <a class="more-coms" onClick={this.displayMoreChildren}>{lang.fr["more_coms"]}</a>
                            )}
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map((e,i,m) => {
                                let follow = "";
                                if (m[i - 1] && m[i - 1].author.id == e.author.id) {
                                    follow = " follow";
                                }
                                return <Message currentUser={this.props.currentUser} message={e} key={e.id} follow={follow}/>
                            })}
                        </div>
                    )}
                </div>
            );
        }
        if (!this.state.message.parent) {
            return (
                <div>
                    <div class="message">
                        <div class="message-head d-flex">
                            { this.state.author && (
                                <img
                                    class="rounded-circle material-shadow avatar"
                                    src={ this.state.author.avatar ? bee.crop(this.state.author.avatar["@id"], 100, 100) : util.defaultAvatar }
                                    title={ this.state.author.name }
                                />
                            )}
                            <div class="infos">
                                { this.state.author && <span class="capitalize author">{ this.state.author.name }</span> }
                                <span>{ util.humanDate(this.state.message.createdAt) }</span>
                            </div>
                            { this.props.currentUser && this.state.author && this.state.author.id == this.props.currentUser.id && (
                                <div tabindex="-1"
                                    class="options dropdown"
                                    onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                    onClick={e => e.currentTarget.classList.toggle("active")}
                                >
                                    <FaIcon family="solid" icon="caret-down"/>
                                    <div class="dropdown-menu">
                                        <a class="seamless-link" onClick={this.editMessage}>{lang.fr["edit"]}</a>
                                        <a class="seamless-link" onClick={this.deleteMessage}>{lang.fr["delete"]}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class="message-body">
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
                        </div>
                    </div>
                    { this.state.message.children && this.state.message.children.length > 0 && (
                        <div>
                            { this.state.displayedChildren < this.state.message.children.length && (
                                <a class="more-coms" onClick={this.displayMoreChildren}>{lang.fr["more_coms"]}</a>
                            )}
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map((e,i,m) => {
                                let follow = "";
                                if (m[i - 1] && m[i - 1].author.id == e.author.id) {
                                    follow = " follow";
                                }
                                return <Message currentUser={this.props.currentUser} message={e} key={e.id} follow={follow}/>
                            })}
                        </div>
                    )}
                    <div class="message child">
                        { this.props.currentUser && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ this.props.currentUser.avatar ? bee.crop(this.props.currentUser.avatar["@id"], 100, 100) : util.defaultAvatar }
                                />
                            </div>
                        )}
                        <Writer
                            parent={this.state.message.id}
                            currentUser={this.props.currentUser}
                            group={this.state.message.group}
                            focus={false}
                        />
                    </div>
                </div>
            );
        }
        return (
            <div>
                <div className={"message child" + this.props.follow}>
                    { this.state.author && (
                        <div class="message-head d-flex d-md-block">
                            <img
                                class="rounded-circle material-shadow avatar"
                                src={ this.state.author.avatar ? bee.crop(this.state.author.avatar["@id"], 100, 100) : util.defaultAvatar }
                                title={ this.state.author.name }
                            />
                            <div class="d-flex d-md-none flex-column infos">
                                <span class="capitalize author">{ this.state.author.name }</span>
                                <span>{ util.humanDate(this.state.message.createdAt) }</span>
                            </div>
                            { this.props.currentUser && this.state.author.id == this.props.currentUser.id && (
                                <div tabindex="-1"
                                    class="options dropdown d-md-none"
                                    onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                    onClick={e => e.currentTarget.classList.toggle("active")}
                                >
                                    <FaIcon family="solid" icon="caret-down"/>
                                    <div class="dropdown-menu">
                                        <a class="seamless-link" onClick={this.editMessage}>{lang.fr["edit"]}</a>
                                        <a class="seamless-link" onClick={this.deleteMessage}>{lang.fr["delete"]}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div class="message-body">
                        { this.state.author && this.props.currentUser && this.state.author.id == this.props.currentUser.id && (
                            <div tabindex="-1"
                                class="options dropdown d-none d-md-flex"
                                onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                onClick={e => e.currentTarget.classList.toggle("active")}
                            >
                                <FaIcon family="solid" icon="caret-down"/>
                                <div class="dropdown-menu">
                                    <a class="seamless-link" onClick={this.editMessage}>{lang.fr["edit"]}</a>
                                    <a class="seamless-link" onClick={this.deleteMessage}>{lang.fr["delete"]}</a>
                                </div>
                            </div>
                        )}
                        { this.state.data && this.state.data.text && (
                            <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                        )}
                        { this.state.preview && (
                            <p class="card-text text-center">
                                <PreviewBlock
                                    key={this.state.preview.url}
                                    url={this.state.preview.url}
                                    preview={this.state.preview.preview}
                                    data={this.state.preview.data}
                                />
                            </p>
                        )}
                        { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        <div class="infos">
                            <span>{ util.humanDate(this.state.message.createdAt) }</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
