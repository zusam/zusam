import { h, render, Component, toChildArray } from "preact";
import { lang } from "/core";
import Message from "./message.component.js";

export default class MessageChildren extends Component {
    render() {
        if (!this.props.children || !this.props.displayedChildren) {
            return null;
        }
        return  (
            <div>
                { this.props.displayedChildren < toChildArray(this.props.children).length && (
                    <a class="more-coms" onClick={this.props.displayMoreChildren}>{lang.t("more_coms")}</a>
                )}
                { toChildArray(this.props.children).map((e,i,m) => {
                    // bypass empty messages
                    if (!e.files.length && e.data["text"] == "" && !e.children.length) {
                        return null;
                    }
                    let follow = "";
                    if (
                        m[i - 1]
                        && m[i - 1].author && e.author
                        && m[i - 1].author.id == e.author.id
                        && i > toChildArray(this.props.children).length - this.props.displayedChildren
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
                            hidden={i < toChildArray(this.props.children).length - this.props.displayedChildren}
                            isPublic={this.props.isPublic}
                        />
                    );
                })}
            </div>
        );
    }
}
