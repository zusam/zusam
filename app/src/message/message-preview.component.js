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
        this.setState({
            title: props.message.data.title || "",
            text: props.message.data.text || ""
        });
        if (props.message.preview) {
            this.setState({preview: props.message.preview});
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
                onClick={ router.onClick }
                title={ this.state.title }
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    { this.getAvatar(this.state.author) }
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
