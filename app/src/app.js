import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";
import Login from "./login.component.js";
import Navbar from "./navbar.component.js";
import FaIcon from "./fa-icon.component.js";
import Writer from "./writer.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        bee.get("apiKey").then(apiKey => {
            if (!apiKey && this.state.route != "login") {
                router.navigate("/login");
            } else {
                router.sync();
            }
        });
    }

    onRouterStateChange(event) {
        const [route, id, action] = router.getSegments();
        bee.get("apiKey").then(apiKey => {
            if (apiKey) {
                bee.get("/api/me").then(user => {
                    if (!user && route != "login") {
                        router.navigate("/login");
                        return;
                    }
                    this.setState({currentUser: user});
                    bee.get("/api/users/" + user.id + "/groups").then(
                        groups => this.setState({groups: groups})
                    );
                });
            } else {
                if (route != "login") {
                    router.navigate("/login");
					return;
                }
            }
        });
		this.setState({route: route, action: action})
        // route and id must be defined from here on
		if (!route && !id) {
            return;
        }
        let url = "/" + route + "/" + id;
        let backUrl = "";
        const entityUrl = "/api/" + route + "/" + id;
        if (action) {
            backUrl = url;
            url += "/" + action;
        }
        if (route == "groups") {
            this.setState({group: entityUrl});
            // soft update message list of the group
            if (this.groupRef && !action && /\/write$/.test(event.detail.from)) {
                this.groupRef.hardUpdate();
            }
        }
        if (id) {
            bee.get(entityUrl).then(
                res => {
                    if (!backUrl) {
                        switch (res["@type"]) {
                            case "Message":
                                backUrl = router.toApp(res.group);
                                break;
                            default:
                                // nothing
                        }
                    }
                    this.setState({
                        url: url,
                        entity: res,
                        backUrl: backUrl,
                        entityUrl: entityUrl,
                    });
                }
            );
        }
    }

    displayMessage() {
        if (this.state.route != "messages" || this.state.entity["@type"] != "Message") {
            return "d-none";
        }
        return "d-flex";
    }

    render() {
        if (!this.state.route) {
            return;
        }
        if (this.state.route == "login") {
            return <Login />;
        }
        if (
            !this.state.currentUser
            || !this.state.entity
            || !this.state.groups
            || !this.state.url
        ) {
            return;
        }
        return (
            <main>
                <Navbar
                    route={this.state.route}
                    entity={this.state.entity}
                    currentUser={this.state.currentUser}
                    groups={this.state.groups}
                    backUrl={this.state.backUrl}
                />
                <article class={"justify-content-center " + this.displayMessage()}>
                    <div class="container">
                        <Message key={this.state.url} url={this.state.entityUrl} />
                    </div>
                </article>
                <div class={
                        this.state.route == "groups" 
                        && !this.state.action
                        && this.state.entity["@type"] == "Group" 
                        ? "d-block" : "d-none"
                }>
                    <GroupBoard ref={g => this.groupRef = g} key={this.state.group} url={this.state.group} />
                    <a class="write material-shadow seamless-link" href={this.state.url + "/write"} onClick={router.onClick}>
                        <FaIcon family={"solid"} icon={"pencil-alt"}/>
                    </a>
                </div>
                <article class={
                        this.state.route == "groups"
                        && this.state.action == "write"
                        && this.state.entity["@type"] == "Group"
                        ? "d-block" : "d-none"
                }>
                    <div class="container">
                        <Writer currentUser={this.state.currentUser} group={this.state.group} backUrl={this.state.backUrl} />
                    </div>
                </article>
            </main>
        );
    }
}

render(<App />, document.body);
