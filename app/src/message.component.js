import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.displayMoreChildren = this.displayMoreChildren.bind(this);
        this.state = {
            url: props.url,
            message: {},
            author: {},
            preview: {},
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
                    bee.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                        this.setState({preview: r});
                    });
                }
            }
        });
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
        return this.state.message && (
            <div class="card shadow-sm mb-1 message">
                { this.state.author && (
                    <div class="card-header d-flex">
                        <img class="rounded w-3" src={ bee.crop(this.state.author.avatar, 50, 50) }/>
                        <div class="d-flex flex-column">
                            <span class="capitalize ml-1">{ this.state.author.name }</span>
                            <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                        </div>
                    </div>
                )}
                <div class="card-body p-1">
                    { this.state.message.data && <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p> }
                    { this.state.preview && <PreviewBlock {...this.state.preview} /> }
                    { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                </div>
                {
                    this.state.message.children && this.state.message.children.length > 0 &&
                    (
                        <div class="card-footer">
                            { this.state.displayedChildren < this.state.message.children.length &&
                                <button class="btn btn-default mb-1" onClick={this.displayMoreChildren}>{lang.fr["more_coms"]}</button>
                            }
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map(e => <Message url={e} key={e}/>) }
                        </div>
                    )
                }
            </div>
        );
    }
}
