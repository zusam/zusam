import { h, render, Component } from "preact";
import { cache, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
    }

    componentDidMount() {
        if (this.state.message && this.state.message.author) {
            cache.get("/api/users/" + this.state.message.author).then(author => author && this.setState({author: author}));
        }
    }

    getAvatar(user) {
        return (
            <img
                title={user ? user.name : ""}
                className={"avatar material-shadow" + (user ? "" : " removed-user")}
                src={user && user.avatar ? util.crop(user.avatar["id"], 100, 100) : util.defaultAvatar}
                onError={e => e.currentTarget.src = util.defaultAvatar}
            />
        );
    }

    render() {
        if (!this.state.message) {
            return null;
        }
        return (
            <a
                class="d-inline-block seamless-link message-preview unselectable"
                href={router.toApp("/messages/" + this.state.message.id)}
                onClick={e => router.onClick(e)}
                title={this.state.message.data["title"]}
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.getAvatar(this.state.author) }
                    { this.state.message.preview ?
                            <div class="card-miniature" style={"background-image: url('" + util.crop(this.state.message.preview, 320, 180) + "')" } />
                            : <div class="text-preview">{this.state.message.data["text"]}</div>
                    }
                    <div class="card-body border-top d-flex justify-content-between">
                        <span class="left-buffer"></span>
                        <span class="title" title={this.state.message.data["title"] || util.humanFullDate(this.state.message.lastActivityDate)}>
                            { this.state.message.data["title"] || util.humanTime(this.state.message.lastActivityDate) }
                        </span>
                        <span class="children">
                            { !!this.state.message.children && (
                                <span>
                                    { this.state.message.children + " " }
                                    <FaIcon family={me.isNew(this.state.message.id) ? "solid" : "regular"} icon={"comment"} />
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </a>
        );
    }
}
