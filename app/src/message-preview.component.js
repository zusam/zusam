import { h, render, Component } from "preact";
import bee from "./bee.js";
import util from "./util.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
        if (props.message.author) {
            bee.get(props.message.author).then(author => author && this.setState({author: author}));
        }
        const msgData = JSON.parse(props.message.data);
        this.setState({
            title: msgData.title || "",
            text: msgData.text || ""
        });
        if (props.message.files.length) {
            this.setState({preview: props.message.files[0]});
        } else {
            if (msgData.text) {
                const links = msgData.text.match(/https?:\/\/[^\s]+/gi);
                if (links) {
                    bee.get("/api/links/by_url?url=" + encodeURIComponent(links[0])).then(
                        r => this.setState({preview: r["preview"]})
                    )
                }
            }
        }
        bee.get("message_" + props.message.id).then(
            lastVisit => this.setState({
                hasNews: !!lastVisit && lastVisit.timestamp < props.message.lastActivityDate
            })
        );
    }

    getTitle() {
        if (!this.state.title) {
            return util.humanDate(this.state.message.lastActivityDate);
        }
        if (this.state.title.length < 24) {
            return this.state.title;
        }
        return this.state.title.slice(0, 21) + "...";
    }

    render() {
        return (
            <a
                class="d-inline-block seamless-link message-preview"
                href={router.toApp(this.state.message["@id"])}
                onClick={router.onClick}
                title={this.state.title}
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.state.author && <img class="avatar material-shadow" src={ bee.crop(this.state.author.avatar, 100, 100) || util.defaultAvatar } /> }
                    { this.state.preview ?
                            <div class="card-miniature" style={"background-image: url('" + bee.crop(this.state.preview, 320, 180) + "')" } />
                            : <div class="text-preview">{ this.state.text }</div>
                    }
                    <div class="card-body border-top d-flex justify-content-between">
                        <span class="left-buffer"></span>
                        <span class="title">{ this.getTitle() }</span>
                        <span className={"children" + (this.state.hasNews ? " text-warning" : "")}>
                            { !!this.state.message.children.length && (
                                <span>
                                    { this.state.message.children.length + " " }
                                    <FaIcon family={"regular"} icon={"comment"} />
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </a>
        );
    }
}
