import { h, render, Component } from "preact";
import Message from "./message.component.js";

export default class MessageChildren extends Component {
    render() {
        if (
            !this.props.message
            || !this.props.message.children
            || this.props.message.children.length == 0
            || !this.props.displayedChildren
        ) {
            return null;
        }
        return  (
            <div>
                { this.props.displayedChildren < this.props.message.children.length && (
                    <a class="more-coms" onClick={this.props.displayMoreChildren}>{lang["more_coms"]}</a>
                )}
                { this.props.message.children.map((e,i,m) => {
                    // bypass empty messages
                    if (!e.files.length && e.data["text"] == "" && !e.children.length) {
                        return null;
                    }
                    let follow = "";
                    if (
                        m[i - 1]
                        && m[i - 1].author && e.author
                        && m[i - 1].author.id == e.author.id
                        && i > this.props.message.children.length - this.props.displayedChildren
                        && (
                            // check if previous message is not empty
                            m[i-1].files.length
                            || m[i-1].data["text"] != ""
                            || m[i-1].children.length
                        )
                    ) {
                        follow = " follow";
                    }
                    return (
                        <Message
                            message={e}
                            key={e.id}
                            follow={follow}
                            hidden={i < this.props.message.children.length - this.props.displayedChildren}
                            isPublic={this.props.isPublic}
                        />
                    );
                })}
            </div>
        );
    }
}
