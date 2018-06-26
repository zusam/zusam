import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";
import Writer from "./writer.component.js";

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.displayMoreChildren = this.displayMoreChildren.bind(this);
        this.onNewMessage = this.onNewMessage.bind(this);
        if (!props.parent) {
            window.addEventListener("newMessage", this.onNewMessage);
        }
        this.state = {
            url: props.url,
            message: null,
            author: null,
            preview: null,
            displayedChildren: 0,
        }
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

    onNewMessage(event) {
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
        let txt = this.state.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

    displayDate(timestamp) {
        if (!timestamp) {
            return null;
        }
        const duration = Date.now() - timestamp*1000;
        if (duration < 1000 * 60 * 60) {
            return lang.fr["there_is"] + " " + Math.floor(duration/1000/60) + "mn";
        }
        if (duration < 1000 * 60 * 60 * 24) {
            return lang.fr["there_is"] + " " + Math.floor(duration/1000/60/60) + "h";
        }
        let date = new Date(timestamp*1000);
        return ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    }

    render() {
        if (!this.state.message || !this.state.message.id) {
            return;
        }
        if (!this.state.message.parent) {
            return (
                <div>
                    <div class="message">
                        { this.state.author && (
                            <div class="message-head p-1 d-flex">
                                <img
                                    class="rounded-circle material-shadow avatar"
                                    src={ bee.crop(this.state.author.avatar, 100, 100) }
                                />
                                <div class="infos">
                                    <span class="capitalize ml-1">{ this.state.author.name }</span>
                                    <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                                </div>
                                { this.state.data && this.state.data.title && (
                                    <div class="title">
                                        <span>{ this.state.data.title }</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div class="message-body">
                            { this.state.message.data && <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p> }
                            { this.state.preview && <p class="card-text"><PreviewBlock {...this.state.preview} /></p> }
                            { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        </div>
                    </div>
                    { this.state.message.children && this.state.message.children.length > 0 && (
                        <div>
                            { this.state.displayedChildren < this.state.message.children.length && (
                                <a class="more-coms" onClick={this.displayMoreChildren}>{lang.fr["more_coms"]}</a>
                            )}
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map(e => <Message url={e} key={e}/>) }
                        </div>
                    )}
                    <div class="message child">
                        { this.props.currentUser && (
                            <div class="message-head p-1 d-none d-md-block">
                                <img
                                    class="rounded-circle w-3 material-shadow avatar"
                                    src={ bee.crop(this.props.currentUser.avatar, 100, 100) }
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
                        <div class="message-head p-1 d-flex d-md-block">
                            <img
                                class="rounded-circle w-3 material-shadow avatar"
                                src={ bee.crop(this.state.author.avatar, 100, 100) }
                            />
                            <div class="d-flex d-md-none flex-column">
                                <span class="capitalize ml-1">{ this.state.author.name }</span>
                                <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                            </div>
                        </div>
                    )}
                    <div class="message-body">
                        { this.state.message.data && <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p> }
                        { this.state.preview && <p class="card-text"><PreviewBlock {...this.state.preview} /></p> }
                        { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                        <div class="infos">
                            {this.state.author && <span class="capitalize">{ this.state.author.name }</span> }
                            <span>{ this.displayDate(this.state.message.createdAt) }</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
