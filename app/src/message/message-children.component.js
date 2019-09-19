import { h, render, Component, toChildArray } from "preact";
import { lang } from "/core";
import MessageChild from "./message-child.component.js";

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

                    return (
                        <MessageChild
                            message={e}
                            key={e.id}
                            hidden={i < toChildArray(this.props.children).length - this.props.displayedChildren}
                            isPublic={this.props.isPublic}
                        />
                    );
                })}
            </div>
        );
    }
}
