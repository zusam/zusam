import { h, render, Component } from "preact";
import { me, util } from "/core";
import lang from "/lang";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";
import FaIcon from "../components/fa-icon.component.js";


export default class MessageBody extends Component {

    displayMessageText() {
        if (!this.props.data) {
            return "";
        }
        // escape html a little (just enough to avoid xss I hope)
        let txt = this.props.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
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

    render() {
        return (
            <div class="message-body">
                { this.props.message.parent
                        && this.props.author
                        && me.me
                        && this.props.author.id == me.me.id
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
                { this.props.data && this.props.data.title && (
                    <div class="title">
                        <span>{ this.props.data.title }</span>
                    </div>
                )}
                { this.props.data && this.props.data.text && (
                    <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                )}
                { this.props.preview && (
                    <p class="text-center card-text">
                        <PreviewBlock
                            key={this.props.preview.url}
                            url={this.props.preview.url}
                            preview={this.props.preview.preview}
                            data={this.props.preview.data}
                        />
                    </p>
                )}
                { this.props.message.files && <FileGrid files={this.props.message.files}/> }
                { this.props.message.parent && (
                    <div class="infos" title={util.humanFullDate(this.props.message.createdAt)}>
                        <span>{ util.humanTime(this.props.message.createdAt) }</span>
                    </div>
                )}
            </div>
        );
    }
}
