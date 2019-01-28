import { h, render, Component } from "preact";
import lang from "./lang.js";
import cache from "./cache.js";
import router from "./router.js";
import me from "./me.js";
import Login from "./login.component.js";
import Signup from "./signup.component.js";
import Navbar from "./navbar.component.js";
import ResetPassword from "./reset-password.component.js";
import MainContent from "./main-content.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        cache.get("apiKey").then(apiKey => {
            let route = router.route || router.getSegments()[0];
            if (apiKey || router.isOutside()) {
                me.update().then(r => {
                    router.sync();
                });
            } else {
                // redirect to login if we don't have an apiKey
                router.navigate("/login");
            }
        });
    }

    onRouterStateChange() {
        this.setState({});
        cache.get("apiKey").then(apiKey => {
            if (apiKey) {
                cache.get("/api/me").then(user => {
                    if (!user && !router.isOutside()) {
                        router.navigate("/login");
                    }
                });
            } else {
                if (!router.isOutside()) {
                    router.navigate("/login");
                }
            }
        });
    }

    render() {
        // external pages for non connected users
        switch (router.route) {
            case "signup":
                return <Signup/>;
                break;
            case "password-reset":
                return <ResetPassword/>;
                break;
            case "login":
                return <Login/>;
                break;
        }

        // here, we enter the "connected" realm of pages.
        // If the user is not connected, what should we do ?
        if (!me.me || !me.me.groups || !router.url) {
            return;
        }

        return (
            <main>
                <Navbar/>
                <div class="content">
                    <MainContent/>
                </div>
            </main>
        );
    }
}

render(<App/>, document.body);
