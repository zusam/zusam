import { h, render, Component, toChildArray } from "preact";
import { lang } from "/core";
import MessageChild from "./message-child.component.js";

export default class MessageChildren extends Component {
    render() {
        if (!this.props.children || (this.props.lastDisplayedChild - this.props.firstDisplayedChild) < 1) {
            return null;
        }
        return  (
            <div>
                { this.props.firstDisplayedChild > 0 && (
                    <div class="d-flex">
                        <a
                            class="more-coms unselectable"
                            onClick={e => this.props.displayPreviousChildren(e)}
                        >
                            {lang.t("previous_coms")}
                        </a>
                    </div>
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
                            hidden={i < this.props.firstDisplayedChild || i > this.props.lastDisplayedChild}
                            isPublic={this.props.isPublic}
                        />
                    );
                })}
                { this.props.lastDisplayedChild < toChildArray(this.props.children).length && (
                    <div class="d-flex">
                        <a
                            class="more-coms unselectable"
                            onClick={e => this.props.displayNextChildren(e)}
                        >
                            {lang.t("next_coms")}
                        </a>
                    </div>
                )}
            </div>
        );
    }
}
