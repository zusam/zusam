import { h, render, Component } from "preact";
import { Suspense, lazy } from "preact/compat";
import { router } from "/core";
import { MessageParent } from "/message";
import CreateGroup from "./create-group.component.js";
import GroupBoard from "./group-board.component.js";
import FaIcon from "./fa-icon.component.js";

const Writer = lazy(() => import("/message/writer.component.js"));
const Settings = lazy(() => import("/settings/settings.component.js"));
const Share = lazy(() => import("./share.component.js"));

export default class MainContent extends Component {

    render() {
        if (this.props.action == "settings") {
            return (
                <article class="mt-2 justify-content-center d-flex">
                    <div class="container">
                        <Suspense fallback={<br/>}>
                            <Settings key={this.props.entityUrl} entityUrl={this.props.entityUrl}/>
                        </Suspense>
                    </div>
                </article>
            );
        }
        switch (this.props.route) {
            case "create-group":
                return <CreateGroup/>;
            case "share":
                return (
                    <Suspense fallback={<br/>}>
                        <Share/>
                    </Suspense>
                );
            case "messages":
                return (
                    <article class="mt-2 justify-content-center d-flex">
                        <div class="container pb-1">
                            <MessageParent key={this.props.url} url={this.props.entityUrl} />
                        </div>
                    </article>
                );
            case "groups":
                if (this.props.action == "write") {
                    return (
                        <article class="mt-2">
                            <div class="container">
                                <Suspense fallback={<br/>}>
                                    <Writer
                                        focus={true}
                                        group={this.props.entityUrl}
                                    />
                                </Suspense>
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
