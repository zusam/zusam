import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";
import Login from "./login.component.js";
import Navbar from "./navbar.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        this.sendLoginForm = this.sendLoginForm.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        bee.retrieveData();
        bee.get("apiKey").then(apiKey => {
            if (!apiKey) {
                router.navigate("/login");
            } else {
                router.sync();
            }
        });
    }

    onRouterStateChange() {
        bee.get("apiKey").then(apiKey => {
            if (apiKey) {
                bee.get("/api/me").then(user => {
                    this.setState({currentUser: user});
                    bee.get("/api/users/" + user.id + "/groups").then(
                        groups => this.setState({groups: groups})
                    );
                });
            }
        });
        bee.get(window.location.pathname).then(page => {
            if (page && page.scrollY) {
                window.scrollY = page.scrollY;
            }
        })
        const [route, id] = router.getSegments();
		this.setState({route: route})
		if (route && id) {
			const url = "/api/" + route + "/" + id;
			bee.get(url).then(
				res => this.setState({
					url: url,
					res: res
				})
			);
		}
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

    render() {
        if (!this.state.route) {
            return;
        }
        if (this.state.route == "login") {
            return <Login />;
        }
        return !!this.state.currentUser && !!this.state.res && !!this.state.groups && (
            <main>
                <Navbar
                    route={this.state.route}
                    res={this.state.res}
                    currentUser={this.state.currentUser}
                    groups={this.state.groups}
                />
                { this.state.url && (
                    <article class="d-flex justify-content-center">
                        { this.state.route == "messages" && this.state.res["@type"] == "Message" && (
                            <div class="container d-flex justify-content-center">
                                <Message key={this.state.url} url={this.state.url} />
                            </div>
                        )}
                        { this.state.route == "groups" && this.state.res["@type"] == "Group" && (
                            <GroupBoard key={this.state.url} url={this.state.url} />
                        )}
                    </article>
                )}
            </main>
        );
    }
}

render(<App />, document.body);
