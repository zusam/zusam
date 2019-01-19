import { h, render, Component } from "preact";
import bee from "./bee.js";
import util from "./util.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.evaluateHasNews = this.evaluateHasNews.bind(this);
        this.state = {
            message: props.message,
        };
        window.addEventListener("viewMessage", this.evaluateHasNews);
        if (props.message.author) {
            bee.get(props.message.author).then(author => author && this.setState({author: author}));
        }
        const msgData = JSON.parse(props.message.data);
        this.setState({
            title: msgData.title || "",
            text: msgData.text || ""
        });
        if (props.message.preview) {
            this.setState({preview: props.message.preview});
        }
        this.evaluateHasNews();
    }

    evaluateHasNews() {
        bee.get("message_" + this.props.message.id).then(
            lastVisit => {
                let groupActivity = this.props.currentUser.groups.find(g => g.id == this.props.groupId).lastActivityDate;
                let hasNews = groupActivity < this.props.message.lastActivityDate;
                if (lastVisit) {
                    hasNews = lastVisit.timestamp < this.props.message.lastActivityDate;
                }
                this.setState({hasNews: hasNews});
            }
        );
    }

    render() {
        return (
            <a
                className={"d-inline-block seamless-link message-preview" + (this.state.hasNews ? " has-news" : "")}
                href={ router.toApp(this.state.message["@id"]) }
                onClick={ router.onClick }
                title={ this.state.title }
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.state.author && <img title={ this.state.author.name } class="avatar material-shadow" src={ this.state.author.avatar ? bee.crop(this.state.author.avatar["@id"], 100, 100) : util.defaultAvatar } /> }
                    { this.state.preview ?
                            <div class="card-miniature" style={"background-image: url('" + bee.crop(this.state.preview, 320, 180) + "')" } />
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
