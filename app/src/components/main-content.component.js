import { h, render, Component } from "preact";
import { router } from "/core";
import { Writer, Message } from "/message";
import { Settings } from "/settings";
import CreateGroup from "./create-group.component.js";
import GroupBoard from "./group-board.component.js";
import FaIcon from "./fa-icon.component.js";

export default class MainContent extends Component {
    
    render() {
        if (this.props.action == "settings") {
            return (
                <article class="justify-content-center d-flex">
                    <div class="container">
                        <Settings key={this.props.entityUrl}/>
                    </div>
                </article>
            );
        }
        switch (this.props.route) {
            case "create-group":
                return <CreateGroup/>;
            case "messages":
                return (
                    <article class="justify-content-center d-flex">
                        <div class="container">
                            <Message key={this.props.url} url={this.props.entityUrl} />
                        </div>
                    </article>
                );
            case "groups":
                if (this.props.action == "write") {
                    return (
                        <article>
                            <div class="container">
                                <Writer
                                    focus={true}
                                    group={this.props.entityUrl}
                                />
                            </div>
                        </article>
                    );
                }
                return (
                    <div>
                        <GroupBoard key={this.props.entityUrl} url={this.props.entityUrl}/>
                        <a class="write-button material-shadow seamless-link" href={this.props.url + "/write"} onClick={router.onClick}>
                            <FaIcon family={"solid"} icon={"pencil-alt"}/>
                        </a>
                    </div>
                );
            default:
        }
    }
}
