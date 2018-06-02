"use strict";
import { h, render, Component } from "preact";
import lang from "./lang.js";
import http from "./http.js";
import store from "./store.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        store.retrieveData();
        store.get("/api/me").then(user => {
            this.setState({currentUser: user});
            store.get("/api/users/" + user.id + "/groups").then(
                groups => this.setState({groups: groups})
            );
            router.sync();
        });
    }

    onRouterStateChange() {
        const [family, id] = router.getSegments();
        const url = "/api/" + family + "/" + id;
        this.setState({
            family: family,
            url: url
        });
    }

    render() {
        return (
            <main>
                <ul class="nav align-items-center shadow-sm">
                    { this.state.currentUser && <img class="avatar" src={ http.crop(this.state.currentUser.avatar, 80, 80) }/> }
                    { this.state.currentUser && (
                        <li class="nav-link groups">
                            <a>{ lang.fr.groups }</a>
                            <ul>
                                { this.state.groups && this.state.groups["hydra:member"].map(
                                    e => <li onClick={() => router.navigate(e["@id"])}>{ e.name }</li>
                                )}
                            </ul>
                        </li>
                    )}
                    <li class="write nav-link btn" role="button"><FaIcon family={"solid"} icon={"pencil-alt"}/></li>
                </ul>
                <div class="nav-buffer"></div>
                { this.state.url && (
                    <article class="d-flex justify-content-center">
                        { this.state.family === "messages" && (
                            <div class="container d-flex justify-content-center">
                                <Message key={this.state.url} url={this.state.url} />
                            </div>
                        )}
                        { this.state.family === "groups" && <GroupBoard key={this.state.url} url={this.state.url} /> }
                    </article>
                )}
            </main>
        );
    }
}

render(<App />, document.body);
