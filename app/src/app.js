"use strict";
import { h, render, Component } from "preact";
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
        this.onStoreStateChange = this.onStoreStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("storeStateChange", this.onStoreStateChange);
        window.addEventListener("popstate", router.sync);
        store.getCurrentUser();
    }

    onRouterStateChange() {
        const [family, id] = router.getSegments();
        const url = "/api/" + family + "/" + id;
        this.setState({
            family: family,
            url: url
        });
    }

    onStoreStateChange() {
        this.setState({currentUser: store.currentUser});
        router.sync();
    }

    render() {
        return (
            <main>
                <nav class="nav align-items-center shadow-sm">
                    { this.state.currentUser && <img class="avatar" src={ http.crop(this.state.currentUser.avatar, 80, 80) }/> }
                    <a class="nav-link" href="#">Settings</a>
                    <a class="nav-link groups">Groups</a>
                    <a class="write nav-link btn" role="button"><FaIcon family={"solid"} icon={"pencil-alt"}/></a>
                </nav>
                <div class="nav-buffer"></div>
                { this.state.url && (
                    <article class="d-flex justify-content-center">
                        { this.state.family === "messages" && (
                            <div class="container d-flex justify-content-center">
                                <Message url={this.state.url} />
                            </div>
                        )}
                        { this.state.family === "groups" && <GroupBoard url={this.state.url} /> }
                    </article>
                )}
            </main>
        );
    }
}

render(<App />, document.body);
