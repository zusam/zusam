import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";
import Login from "./login.component.js";
import Signup from "./signup.component.js";
import Navbar from "./navbar.component.js";
import FaIcon from "./fa-icon.component.js";
import Writer from "./writer.component.js";
import Settings from "./settings.component.js";
import ResetPassword from "./reset-password.component.js";
import CreateGroup from "./create-group.component.js";

class App extends Component {

    constructor() {
        super();
        this.state = {
            entity: {},
            url: "",
        }
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        bee.get("apiKey").then(apiKey => {
            let route = this.state.route || router.getSegments()[0];
            if (apiKey || this.isOutsideRoute(route)) {
                router.sync();
            } else {
                // redirect to login if we don't have an apiKey
                router.navigate("/login");
            }
        });
    }

    isOutsideRoute(route) {
        return [
            "login",
            "password-reset",
            "signup",
            "invitation"
        ].includes(route);
    }

    onRouterStateChange(event) {
        const [route, id, action] = router.getSegments();
        bee.get("apiKey").then(apiKey => {
            if (apiKey) {
                bee.get("/api/me").then(user => {
                    if (!user && !this.isOutsideRoute(route)) {
                        router.navigate("/login");
                        return;
                    }
                    this.setState({
                        currentUser: user,
                        groups: user.groups,
                    });
                });
            } else {
                if (!this.isOutsideRoute(route)) {
                    router.navigate("/login");
					return;
                }
            }
        });
		this.setState({route: route, action: action})
        // route and id must be defined from here on
		if (!route || !id) {
            return;
        }
        let url = "/" + route + "/" + id;
        let backUrl = "";
        const entityUrl = "/api/" + route + "/" + id;
        if (action) {
            switch (route) {
                case "users":
                    backUrl = "/";
                    break;
                default:
                    backUrl = url;
            }
            url += "/" + action;
        }
        if (route == "groups") {
            this.setState({group: entityUrl});
            // soft update message list of the group
            if (this.groupRef) {
                if (event.detail.data && event.detail.data.resetGroupDisplay) {
                    this.groupRef.resetGroupDisplay(true, true);
                } else {
                    this.groupRef.restoreScroll();
                }
            }
        }
        if (id) {
            bee.get(entityUrl).then(
                res => {
                    let backUrlPrompt = "";
                    if (!backUrl && res["group"]) {
                        backUrl = router.toApp(res.group);
                    }
                    if (route == "groups" && action == "write") {
                        backUrlPrompt = lang.fr["cancel_write"];
                    }
                    this.setState({
                        url: url,
                        entity: res,
                        entityUrl: entityUrl,
                        backUrl: backUrl,
                        backUrlPrompt: backUrlPrompt,
                    });
                }
            );
        }
    }

    render() {
        if (!this.state.route) {
            return;
        }
        if (this.state.route == "login") {
            return <Login />;
        }
        if (this.state.route == "signup") {
            return <Signup />;
        }
        if (this.state.route == "password-reset") {
            return <ResetPassword />;
        }
        if (!this.state.currentUser || !this.state.groups) {
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
                    backUrlPrompt={this.state.backUrlPrompt}
                />
                <div class="content">
                    { this.state.route == "create-group" && <CreateGroup /> }
                    { this.state.action && this.state.action == "settings" && this.state.entityUrl && (
                        <article class="justify-content-center d-flex">
                            <div class="container">
                                <Settings key={this.state.entityUrl} currentUser={this.state.currentUser} groups={this.state.groups}/>
                            </div>
                        </article>
                    )}
                    { this.state.route == "messages" && this.state.entity["@type"] == "Message" && (
                        <article class="justify-content-center d-flex">
                            <div class="container">
                                <Message currentUser={this.state.currentUser} key={this.state.url} url={this.state.entityUrl} />
                            </div>
                        </article>
                    )}
                    <div class={
                            this.state.route == "groups"
                            && !this.state.action
                            && this.state.entity
                            ? "d-block" : "d-none"
                    }>
                        <GroupBoard ref={g => this.groupRef = g} key={this.state.group} url={this.state.group} />
                        <a class="write-button material-shadow seamless-link" href={this.state.url + "/write"} onClick={router.onClick}>
                            <FaIcon family={"solid"} icon={"pencil-alt"}/>
                        </a>
                    </div>
                    { this.state.route == "groups" && this.state.action == "write" && this.state.entity && (
                        <article>
                            <div class="container">
                                <Writer
                                    focus={true}
                                    currentUser={this.state.currentUser}
                                    group={this.state.group}
                                    backUrl={this.state.backUrl}
                                />
                            </div>
                        </article>
                    )}
                </div>
            </main>
        );
    }
}

render(<App />, document.body);
