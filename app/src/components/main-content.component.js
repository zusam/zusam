import { h, render, Component } from "preact";
import { router } from "/core";
import { MessageParent } from "/message";
import CreateGroup from "./create-group.component.js";
import GroupSearch from "./group-search.component.js";
import GroupBoard from "./group-board.component.js";
import FaIcon from "./fa-icon.component.js";
import Writer from "/message/writer.component.js";
import Settings from "/settings/settings.component.js";
import Share from "./share.component.js";

export default class MainContent extends Component {

    render() {
        if (this.props.action == "settings") {
            return (
                <article class="mt-2 justify-content-center d-flex">
                    <div class="container">
                        <Settings key={this.props.entityUrl} entityUrl={this.props.entityUrl}/>
                    </div>
                </article>
            );
        }
        switch (this.props.route) {
            case "create-group":
                return <CreateGroup/>;
            case "share":
                return (
                    <Share/>
                );
            case "messages":
                return (
                    <article class="mt-2 justify-content-center d-flex">
                        <div class="container pb-1">
                            <MessageParent
                                focus={!!router.getParam("focus", router.search)}
                                key={this.props.id}
                                url={this.props.entityUrl}
                            />
                        </div>
                    </article>
                );
            case "groups":
                if (this.props.action == "write") {
                    return (
                        <article class="mt-2">
                            <div class="container">
                                <Writer focus={true} group={this.props.id} />
                            </div>
                        </article>
                    );
                }
                if (router.getParam('search') || router.getParam('hashtags')) {
                    return (
                        <div>
                            <GroupSearch key={this.props.id}/>
                        </div>
                    );
                }
                return (
                    <div>
                        <GroupBoard key={this.props.id}/>
                        <a
                            class="write-button material-shadow seamless-link"
                            href={router.toApp("/groups/" + this.props.id + "/write")}
                            onClick={router.onClick}
                        >
                            <FaIcon family={"solid"} icon={"pencil-alt"}/>
                        </a>
                    </div>
                );
            default:
        }
    }
}
