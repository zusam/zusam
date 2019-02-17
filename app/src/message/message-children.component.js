import { h, render, Component } from "preact";
import { lang, me, util } from "/core";
import Message from "./message.component.js";

export default class MessageChildren extends Component {

    render() {
        if (
            this.props.message.parent
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
                    let follow = "";
                    if (
                        m[i - 1]
                        && m[i - 1].author.id == e.author.id
                        && i > this.props.message.children.length - this.props.displayedChildren
                    ) {
                        follow = " follow";
                    }
                    return (
                        <Message
                            message={e}
                            key={e.id}
                            follow={follow}
                            hidden={i < this.props.message.children.length - this.props.displayedChildren}
                        />
                    );
                })}
            </div>
        );
    }
}
