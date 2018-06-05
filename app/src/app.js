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
        this.sendLoginForm = this.sendLoginForm.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        bee.retrieveData();
        bee.get("apiKey").then(apiKey => {
            if (!apiKey) {
                this.setState({apiKey: ""});
                router.navigate("/login");
            } else {
				this.start();
            }
        });
    }

	start() {
		bee.get("/api/me").then(user => {
			this.setState({currentUser: user});
			bee.get("/api/users/" + user.id + "/groups").then(
				groups => this.setState({groups: groups})
			);
			router.sync();
		});
	}

    onRouterStateChange() {
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
        if (this.state.route === "login") {
            return (
                <div class="login">
                    <div class="login-form">
                        <img src="zusam_logo.svg"/>
                        <form>
                            <div class="form-group">
                                <input type="text" class="form-control" id="login" placeholder={lang.fr.login_placeholder} />
                            </div>
                            <div class="form-group">
                                <input type="password" class="form-control" id="password" placeholder={lang.fr.password_placeholder} />
                            </div>
                            <button type="submit" class="btn btn-light" onClick={this.sendLoginForm}>{lang.fr.submit}</button>
                        </form>
                    </div>
                </div>
            );
        }
        return !!this.state.currentUser && !!this.state.res && (
            <main>
                <div class="nav align-items-center shadow-sm">
                    <div class="avatar">
                        <img class="rounded-circle" src={ bee.crop(this.state.currentUser.avatar, 80, 80) }/>
                    </div>
                    { this.state.route === "messages" && (
                        <a class="seamless-link back" href={router.toApp(this.state.res.group)} onClick={router.onClick}>
                            <FaIcon family={"solid"} icon={"arrow-left"}/>
                        </a>
                    )}
                    { this.state.route === "groups" && <span class="title">{this.state.res.name}</span> }
                    <div
                        class="nav-link dropdown groups" tabindex="0"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                        <div>{ lang.fr.groups } <FaIcon family={"solid"} icon={"caret-down"}/></div>
                        <div class="dropdown-menu">
                            { this.state.groups && this.state.groups["hydra:member"] && this.state.groups["hydra:member"].map(
                                e => <a class="seamless-link" href={router.toApp(e["@id"])} onClick={router.onClick}>{e.name}</a>
                            )}
                        </div>
                    </div>
                </div>
                { this.state.url && (
                    <article class="d-flex justify-content-center">
                        { this.state.route === "messages" && (
                            <div class="container d-flex justify-content-center">
                                <Message key={this.state.url} url={this.state.url} />
                            </div>
                        )}
                        { this.state.route === "groups" && <GroupBoard key={this.state.url} url={this.state.url} /> }
                    </article>
                )}
            </main>
        );
    }
}

render(<App />, document.body);
