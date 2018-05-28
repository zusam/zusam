import { h, render, Component } from "preact";
import http from "./http.js";
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
        http.get(props.url).then(msg => {
            this.setState({
                message: msg,
                displayedChildren: msg.children && 5 // display 5 first children
            });
            http.get(msg.author).then(author => {
                this.setState({author: author});
            });
            if (msg.data) {
                let previewUrl = msg.data.match(/(https?:\/\/[^\s]+)/gi);
                if (previewUrl) {
                    http.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => this.setState({preview: r}));
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
        if (url.length < 50) {
            return url;
        }
        return url.slice(0, 25) + "..." + url.slice(-24);
    }

    displayMessageText() {
        // escape html a little (just enough to avoid injection)
        let txt = this.state.message.data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
        let date = new Date(timestamp*1000);
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }

    render() {
        return this.state.message && (
            <div class="card mb-1">
                { this.state.author && (
                    <div class="card-header d-flex">
                        <img class="rounded w-3" src={ http.crop(this.state.author.avatar, 50, 50) }/>
                        <div class="d-flex flex-column">
                            <span class="capitalize ml-1">{ this.state.author.name }</span>
                            <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                        </div>
                    </div>
                )}
                <div class="card-body">
                    { this.state.message.data && <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p> }
                    { this.state.preview && <PreviewBlock {...this.state.preview} /> }
                    { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                </div>
                {
                    this.state.message.children && this.state.message.children.length > 0 &&
                    (
                        <div class="card-footer">
                            { this.state.displayedChildren < this.state.message.children.length &&
                                <button onClick={this.displayMoreChildren}>Voir plus de commentaires</button>
                            }
                            { this.state.message.children.slice(-1 * this.state.displayedChildren).map(e => <Message url={e} key={e}/>) }
                        </div>
                    )
                }
            </div>
        );
    }
}
