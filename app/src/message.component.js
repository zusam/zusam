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
        this.onNewChild = this.onNewChild.bind(this);
        if (!props.parent) {
            window.addEventListener("newChild", this.onNewChild);
        }
        this.state = {
            url: props.url,
            message: null,
            author: null,
            preview: null,
            displayedChildren: 0,
        };
        bee.get(props.url).then(msg => {
            this.setState({
                message: msg,
                displayedChildren: msg.children && 5 // display 5 first children
            });
            bee.set("message_" + msg.id, {timestamp: Date.now()});
            bee.get(msg.author).then(author => {
                this.setState({author: author});
            });
            if (msg.data) {
                const data = JSON.parse(msg.data);
                this.setState({data: data});
                let previewUrl = data["text"].match(/(https?:\/\/[^\s]+)/gi);
                if (previewUrl) {
                    bee.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => r && this.setState({preview: r}));
                }
            }
        });
    }

    deleteMessage(event) {
		event.preventDefault();
        if(window.confirm(lang.fr["ask_delete_message"])) {
            bee.http.delete(this.state.message["@id"]);
            bee.remove(this.state.message["@id"]);
            if (this.state.message.parent) {
                this.setState({isRemoved: true});
            } else {
                router.navigate(router.toApp(this.state.message.group), {data: {resetGroupDisplay: true}});
            }
        }
    }

    onNewChild(event) {
        const newMsg = event.detail;
        let msg = this.state.message;
        if (newMsg.parent && newMsg.parent == msg["@id"]) {
            msg.children = [...msg.children, newMsg["@id"]];
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
        if (!this.state.message.parent) {
            return (
                <div>
                    <div class="message">
                        <div class="message-head d-flex">
                            { this.state.author && (
                                <img
                                    class="rounded-circle material-shadow avatar"
                                    src={ bee.crop(this.state.author.avatar, 100, 100) || util.defaultAvatar }
                                />
                            )}
                            <div class="infos">
                                { this.state.author && <span class="capitalize ml-1">{ this.state.author.name }</span> }
                                <span class="ml-1">{ util.humanDate(this.state.message.createdAt) }</span>
                            </div>
                            { this.state.data && this.state.data.title && (
                                <div class="title">
                                    <span>{ this.state.data.title }</span>
                                </div>
                            )}
                            { this.props.currentUser && this.state.author && this.state.author.id == this.props.currentUser.id && (
                                <div tabindex="-1"
                                    class="options dropdown"
                                    onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                    onClick={e => e.currentTarget.classList.toggle("active")}
                                >
                                    <FaIcon family="solid" icon="caret-down"/>
                                    <div class="dropdown-menu">
                                        <a class="seamless-link" onClick={this.deleteMessage}>{lang.fr["delete"]}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class="message-body">
                            { this.state.data && this.state.data.text && (
                                <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                            )}
                            { this.state.preview && <p class="text-center card-text"><PreviewBlock {...this.state.preview} /></p> }
                            { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        </div>
                    </div>
                    { this.state.message.children && this.state.message.children.length > 0 && (
                        <div>
                            { this.state.displayedChildren < this.state.message.children.length && (
                                <a class="more-coms" onClick={this.displayMoreChildren}>{lang.fr["more_coms"]}</a>
                            )}
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map(e => <Message currentUser={this.props.currentUser} url={e} key={e}/>) }
                        </div>
                    )}
                    <div class="message child">
                        { this.props.currentUser && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ bee.crop(this.props.currentUser.avatar, 100, 100) || util.defaultAvatar }
                                />
                            </div>
                        )}
                        <Writer
                            parent={this.state.message.id}
                            currentUser={this.props.currentUser}
                            group={this.state.message.group}
                        />
                    </div>
                </div>
            );
        }
        return (
            <div>
                <div class="message child">
                    { this.state.author && (
                        <div class="message-head d-flex d-md-block">
                            <img
                                class="rounded-circle material-shadow avatar"
                                src={ bee.crop(this.state.author.avatar, 100, 100) }
                            />
                            <div class="d-flex d-md-none flex-column">
                                <span class="capitalize ml-1">{ this.state.author.name }</span>
                                <span class="ml-1">{ util.humanDate(this.state.message.createdAt) }</span>
                            </div>
                            { this.props.currentUser && this.state.author.id == this.props.currentUser.id && (
                                <div tabindex="-1"
                                    class="options dropdown d-md-none"
                                    onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                                    onClick={e => e.currentTarget.classList.toggle("active")}
                                >
                                    <FaIcon family="solid" icon="caret-down"/>
                                    <div class="dropdown-menu">
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
                                    <a class="seamless-link" onClick={this.deleteMessage}>{lang.fr["delete"]}</a>
                                </div>
                            </div>
                        )}
                        { this.state.data && this.state.data.text && (
                            <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                        )}
                        { this.state.preview && <p class="card-text text-center"><PreviewBlock {...this.state.preview} /></p> }
                        { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        <div class="infos">
                            {this.state.author && <span class="capitalize">{ this.state.author.name }</span> }
                            <span>{ util.humanDate(this.state.message.createdAt) }</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
