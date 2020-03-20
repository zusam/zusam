import { h, render, Component } from "preact";
import { lazy } from "preact/compat";
import { alert, lang, cache, router, me } from "/core";
import { Navbar } from "/navbar";
import { MainContent } from "/pages";
import {
  Login,
  Public,
  ResetPassword,
  Signup,
  StopNotificationEmails
} from "/outside";

class App extends Component {
  constructor() {
    super();
    this.onRouterStateChange = this.onRouterStateChange.bind(this);
    window.addEventListener("routerStateChange", this.onRouterStateChange);
    window.addEventListener("meStateChange", _ => this.setState({ me: me.me }));
    window.addEventListener("fetchedNewDict", _ => this.setState({}));
    window.addEventListener("popstate", router.sync);
    window.addEventListener("click", e => {
      // close dropdowns if we are clicking on something else
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(n => n.classList.remove("active"));
      }
    });
    lang.fetchDict();
    cache.get("apiKey").then(apiKey => {
      if (router.isOutside() || apiKey) {
        router.sync();
      } else {
        // redirect to login if we don't have an apiKey
        router.navigate("/login");
      }
    });
    this.state = {
      action: router.action,
      route: router.route,
      id: router.id,
      entityUrl: router.entityUrl
    };
  }

  onRouterStateChange() {
    this.setState({
      action: router.action,
      route: router.route,
      id: router.id,
      entityUrl: router.entityUrl
    });
    setTimeout(() => window.scrollTo(0, 0));
    cache.get("apiKey").then(apiKey => {
      if (apiKey && router.route != "login") {
        me.get().then(user => {
          if (!user && !router.isOutside()) {
            cache.set("apiKey", "").then(_ => router.navigate("/login"));
          } else {
            this.setState({
              action: router.action,
              route: router.route,
              id: router.id,
              me: user,
              entityUrl: router.entityUrl
            });
          }
        });
      } else {
        if (!router.isOutside()) {
          router.navigate("/login");
        }
      }
    });
    alert.add(lang.t(router.getParam("alert", router.search)));
  }

  render() {
    // external pages for non connected users
    switch (this.state.route) {
      case "signup":
        return <Signup />;
        break;
      case "stop-notification-emails":
        return <StopNotificationEmails />;
        break;
      case "public":
        return <Public token={this.state.id} key={this.state.id}/>;
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
    if (!this.state.me || !this.state.me.groups) {
      return;
    }

    return (
      <main>
        <Navbar />
        <div class="content">
          <MainContent {...this.state} />
        </div>
      </main>
    );
  }
}

render(<App />, document.body);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed
      console.warn('ServiceWorker registration failed: ', err);
    });
  });
}
