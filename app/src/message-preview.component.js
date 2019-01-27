import { h, render, Component } from "preact";
import cache from "./cache.js";
import util from "./util.js";
import me from "./me.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
        if (props.message.author) {
            cache.get(props.message.author).then(author => author && this.setState({author: author}));
        }
        this.setState({
            title: props.message.data.title || "",
            text: props.message.data.text || ""
        });
        if (props.message.preview) {
            this.setState({preview: props.message.preview});
        }
    }

    render() {
        return (
            <a
                className={
                    "d-inline-block seamless-link message-preview"
                        + (me.isNews(this.state.message.id) ? " has-news" : "")
                }
                href={ router.toApp(this.state.message["@id"]) }
                onClick={ router.onClick }
                title={ this.state.title }
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.state.author && <img title={ this.state.author.name } class="avatar material-shadow" src={ this.state.author.avatar ? util.crop(this.state.author.avatar["@id"], 100, 100) : util.defaultAvatar } /> }
                    { this.state.preview ?
                            <div class="card-miniature" style={"background-image: url('" + util.crop(this.state.preview, 320, 180) + "')" } />
                            : <div class="text-preview">{ this.state.text }</div>
                    }
                    <div class="card-body border-top d-flex justify-content-between">
                        <span class="left-buffer"></span>
                        <span class="title" title={ this.state.title || util.humanFullDate(this.state.message.lastActivityDate)}>
                            { this.state.title || util.humanTime(this.state.message.lastActivityDate) }
                        </span>
                        <span class="children">
                            { !!this.state.message.children && (
                                <span>
                                    { this.state.message.children + " " }
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
