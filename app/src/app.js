import { h, render, Component } from "preact";
import { lang, cache, router, me } from "/core";
import { Login, Signup, ResetPassword } from "/outside";
import Navbar from "./components/navbar.component.js";
import MainContent from "./components/main-content.component.js";

class App extends Component {

    constructor() {
        super();
        this.onRouterStateChange = this.onRouterStateChange.bind(this);
        window.addEventListener("routerStateChange", this.onRouterStateChange);
        window.addEventListener("popstate", router.sync);
        cache.get("apiKey").then(apiKey => {
            if (router.isOutside() || apiKey) {
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
        if (!me.me || !me.me.groups) {
            return;
        }

        return (
            <main>
                <Navbar/>
                <div class="content">
                    <MainContent route="router.route"/>
                </div>
            </main>
        );
    }
}

render(<App/>, document.body);
