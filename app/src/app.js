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
        this.sendLoginForm = this.sendLoginForm.bind(this);
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

    onRouterStateChange() {
        const [route, id, action] = router.getSegments();
		this.setState({route: route, action: action})
		if (route && id) {
            let url = "/" + route + "/" + id;
            let backUrl = "";
            const entityUrl = "/api/" + route + "/" + id;
            if (action) {
                backUrl = url;
                url += "/" + action;
            }
            if (route == "groups") {
                this.setState({group: entityUrl});
            }
			bee.get(entityUrl).then(
                res => {
                    if (!backUrl) {
                        switch (res["@type"]) {
                            case "Message":
                                backUrl = router.toApp(this.props.res.group);
                                break;
                            case "Group":
                            default:
                        }
                    }
                    this.setState({
                        url: url,
                        res: res,
                        backUrl: backUrl,
                        entityUrl: entityUrl,
                    });
                }
			);
		}
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
                }
            }
        });
    }

	sendLoginForm(e) {
		e.preventDefault();
		const login = document.getElementById("login").value;
		const password = document.getElementById("password").value;
		bee.http.post("/api/login", {login: login, password: password}).then(res => {
			if (res) {
				bee.set("apiKey", res.api_key);
				router.navigate("/");
				this.start();
			}
		})
	}

    displayMessage() {
        if (this.state.route != "messages" || this.state.res["@type"] != "Message") {
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
            || !this.state.res
            || !this.state.groups
            || !this.state.url
        ) {
            return;
        }
        return (
            <main>
                <Navbar
                    route={this.state.route}
                    res={this.state.res}
                    currentUser={this.state.currentUser}
                    groups={this.state.groups}
                    backUrl={this.state.backUrl}
                />
                <article class={"justify-content-center " + this.displayMessage()}>
                    <div class="container">
                        <Message key={this.state.url} url={this.state.url} />
                    </div>
                </article>
                <div class={
                        this.state.route == "groups" 
                        && this.state.action != "write"
                        && this.state.res["@type"] == "Group" 
                        ? "d-block" : "d-none"
                }>
                    <GroupBoard key={this.state.group} url={this.state.group} />
                    <a class="write material-shadow seamless-link" href={this.state.url + "/write"} onClick={router.onClick}>
                        <FaIcon family={"solid"} icon={"pencil-alt"}/>
                    </a>
                </div>
                <div class={
                        this.state.route == "groups"
                        && this.state.action == "write"
                        && this.state.res["@type"] == "Group"
                        ? "d-block" : "d-none"
                }>
                    <div class="container">
                        <Writer currentUser={this.state.currentUser} />
                    </div>
                </div>
            </main>
        );
    }
}

render(<App />, document.body);
