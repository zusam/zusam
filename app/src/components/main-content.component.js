import { h, render, Component } from "preact";
import { router } from "/core";
import { Writer, Message } from "/message";
import { Settings } from "/settings";
import CreateGroup from "./create-group.component.js";
import GroupBoard from "./group-board.component.js";
import FaIcon from "./fa-icon.component.js";

export default class MainContent extends Component {

    render() {
        if (router.action == "settings") {
            return (
                <article class="justify-content-center d-flex">
                    <div class="container">
                        <Settings key={router.entityUrl}/>
                    </div>
                </article>
            );
        }
        switch (router.route) {
            case "create-group":
                return <CreateGroup/>;
            case "messages":
                return (
                    <article class="justify-content-center d-flex">
                        <div class="container">
                            <Message key={router.url} url={router.entityUrl} />
                        </div>
                    </article>
                );
            case "groups":
                if (router.action == "write") {
                    return (
                        <article>
                            <div class="container">
                                <Writer
                                    focus={true}
                                    group={router.entityUrl}
                                />
                            </div>
                        </article>
                    );
                }
                return (
                    <div>
                        <GroupBoard key={router.entityUrl} url={router.entityUrl}/>
                        <a class="write-button material-shadow seamless-link" href={router.url + "/write"} onClick={router.onClick}>
                            <FaIcon family={"solid"} icon={"pencil-alt"}/>
                        </a>
                    </div>
                );
            default:
        }
    }
}
