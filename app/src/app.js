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
        this.updateGroupsState = this.updateGroupsState.bind(this);
        window.addEventListener("viewGroup", this.updateGroupState);
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

    // check if route is "outside": accessible to non connected user
    isOutsideRoute(route) {
        return [
            "login",
            "password-reset",
            "signup",
            "invitation"
        ].includes(route);
    }

    updateGroupsState() {
        let groups = this.state.groups;
        groups.map(group => {
            bee.get("group_" + group.id).then(
                lastVisit => {
                    group.hasNews = true;
                    if (lastVisit) {
                        group.hasNews = lastVisit.timestamp < group.lastActivityDate;
                    }
                    this.setState({groups: groups});
                }
            );
        });
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
                    this.updateGroupsState();
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
            if (this.groupRef) {
                if (event.detail.data && event.detail.data.resetGroupDisplay) {
                    // soft update message list of the group
                    this.groupRef.resetGroupDisplay(true, true);
                } else {
                    // restore scrolling if normal entrance to group dashboard
                    this.groupRef.restoreScroll();
                }
            }
        }

        if (id) {
            bee.get(entityUrl).then(
                res => {
                    // set backUrl and backUrlPrompt.
                    // These will dictate navbar behavior for the back button
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
        // external pages for non connected users
        switch (this.state.route) {
            case "signup":
                return <Signup />;
                break;
            case "password-reset":
                return <ResetPassword />;
                break;
            case "login":
                return <Login />;
                break;
        }

        // here, we enter the "connected" realm of pages.
        // If the user is not connected, what should we do ?
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
                        <GroupBoard
                            ref={g => this.groupRef = g}
                            key={this.state.group}
                            url={this.state.group}
                            currentUser={this.state.currentUser}
                        />
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
