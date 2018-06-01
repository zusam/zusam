"use strict";
import { h, render, Component } from "preact";
import http from "./http.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";
import FaIcon from "./fa-icon.component.js";

class App extends Component {

    constructor() {
        super();
        http.get("/api/me").then(user => {
            this.setState({user: user});
            const segments = window.location.pathname.slice(1).split("/")
            switch (segments[0]) {
                case "messages":
                    this.setState({
                        show: "message",
                        url: "/api/messages/" + segments[1],
                    });
                    break;
                case "groups":
                    this.setState({
                        show: "group",
                        url: "/api/groups/" + segments[1],
                    });
                    break;
                default:
                    history.pushState(null, "", "/groups/" + http.getId(user.groups[0]));
                    this.setState({
                        show: "group",
                        url: "/api/groups/" + http.getId(user.groups[0]),
                    });
            }
        });
    }

    render() {
        return (
            <main>
                <nav class="nav align-items-center shadow-sm">
                    { this.state.user && <img class="avatar" src={ http.crop(this.state.user.avatar, 80, 80) }/> }
                    <a class="nav-link" href="#">Settings</a>
                    <a class="nav-link groups">Groups</a>
                    <a class="write nav-link btn" role="button"><FaIcon family={"solid"} icon={"pencil-alt"}/></a>
                </nav>
                <div class="nav-buffer"></div>
                <article class="d-flex justify-content-center">
                    { this.state.show === "message" && this.state.url && (
                        <div class="container d-flex justify-content-center">
                            <Message url={this.state.url} />
                        </div>
                    )}
                    { this.state.show === "group" && this.state.url && <GroupBoard url={this.state.url} /> }
                </article>
            </main>
        );
    }
}

render(<App />, document.body);
