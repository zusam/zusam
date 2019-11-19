import { h, render, Component } from "preact";
import { cache, lang, me, util } from "/core";
import EmbedBlock from "./embed-block.component.js";
import FileGrid from "./file-grid.component.js";
import FaIcon from "../components/fa-icon.component.js";

export default class MessageBody extends Component {

    constructor(props) {
        super(props);
        this.state = {preview: null};
    }

    displayMessageText() {
        if (!this.props.message.data) {
            return "";
        }
        // escape html a little (just enough to avoid xss I hope)
        let txt = this.props.message.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
        // replace url by real links
        let shift = 0;
        let match = null;
        while (match = util.getUrl(txt.slice(shift))) {
            let url = match[0];
            if (url.length >= 50) {
                url = url.slice(0, 25) + "..." + url.slice(-24);
            }
            let link = '<a href="' + match[0] + '" target="_blank">' + url + '</a>';
            txt = txt.slice(0, match["index"] + shift) + link + txt.slice(match["index"] + shift + match[0].length);
            shift += match["index"] + link.length;
        }
        // replace line returns
        txt = txt.replace(/\n/g, "<br/>");
        return {__html: txt};
    }

    componentWillUpdate() {
        if (!this.state.gotPreview && this.props.message) {
            if (this.props.message.data) {
                let previewUrl = util.getUrl(this.props.message.data["text"]);
                if (previewUrl) {
                    cache.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                        this.setState(prevState => ({
                            preview: r,
                            gotPreview: true,
                        }));
                    });
                } else {
                    this.setState(prevState => ({
                        gotPreview: true,
                    }));
                }
            }
        }
    }

    render() {
        return (
            <div class="message-body">
                { this.props.message.data && this.props.message.data.title && (
                    <div class="title">
                        <span>{ this.props.message.data.title }</span>
                    </div>
                )}
                { this.props.message.data && this.props.message.data.text && this.props.message.data.text.trim() && (
                    <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                )}
                { this.state.preview && (
                    <EmbedBlock
                        key={this.state.preview.url}
                        url={this.state.preview.url}
                        preview={this.state.preview.preview}
                        data={this.state.preview.data}
                    />
                )}
                { this.props.message.files && <FileGrid files={this.props.message.files}/> }
            </div>
        );
    }
}
