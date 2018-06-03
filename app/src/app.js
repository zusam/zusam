"use strict";
import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        this.back = this.back.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        bee.retrieveData();
        bee.set("apiKey", "cf912e30-3a08-4e52-b372-0ef351408f27");
        bee.get("/api/me").then(user => {
            this.setState({currentUser: user});
            bee.get("/api/users/" + user.id + "/groups").then(
                groups => this.setState({groups: groups})
            );
            router.sync();
        });
    }

    onRouterStateChange(e) {
        const [family, id] = router.getSegments();
        const url = "/api/" + family + "/" + id;
        bee.get(url).then(
            res => this.setState({
                family: family,
                url: url,
                res: res
            })
        );
    }

    back(e) {
        router.onClick(e);
    }

    render() {
        return !!this.state.currentUser && (
            <main>
                <ul class="nav align-items-center shadow-sm">
                    { this.state.family === "messages" && (
                        <a class="seamless-link back" href={router.toApp(this.state.res.group)} onClick={this.back}>
                            <FaIcon family={"solid"} icon={"arrow-left"}/>
                        </a>
                    )}
                    <li class="nav-link groups">
                        <a>{ lang.fr.groups } <FaIcon family={"solid"} icon={"caret-down"}/></a>
                        <ul>
                            { this.state.groups && this.state.groups["hydra:member"] && this.state.groups["hydra:member"].map(
                                e => <a class="seamless-link" href={router.toApp(e["@id"])} onClick={router.onClick}>{e.name}</a>
                            )}
                        </ul>
                    </li>
                    { this.state.family === "groups" && <span class="title">{this.state.res.name}</span> }
                    <img class="avatar" src={ bee.crop(this.state.currentUser.avatar, 80, 80) }/>
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
