import { h, render, Component } from "preact";
import { cache, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
        if (props.message.author) {
            cache.get("/api/users/" + props.message.author).then(author => author && this.setState({author: author}));
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
        return (
            <a
                class="d-inline-block seamless-link message-preview unselectable"
                href={router.toApp("/messages/" + this.state.message.id)}
                onClick={e => router.onClick(e)}
                title={this.props.title}
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.getAvatar(this.state.author) }
                    { this.props.message.preview ?
                            <div class="card-miniature" style={"background-image: url('" + util.crop(this.props.message.preview, 320, 180) + "')" } />
                            : <div class="text-preview">{ this.props.text }</div>
                    }
                    <div class="card-body border-top d-flex justify-content-between">
                        <span class="left-buffer"></span>
                        <span class="title" title={ this.props.title || util.humanFullDate(this.state.message.lastActivityDate)}>
                            { this.props.title || util.humanTime(this.state.message.lastActivityDate) }
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
