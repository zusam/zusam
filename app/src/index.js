import { h, render } from "preact";
import App from './app.js';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { StoreContext } from 'storeon/preact';
import store from "/src/store";

function Index() {
  return (
    <Router>
      <MainRouter />
    </Router>
  );
}

function MainRouter() {
  return (
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>
  );
}

render(<Index />, document.body);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (location.search.includes("service-workers=unregister")) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
      console.log("Service workers unregistered");
    }
    navigator.serviceWorker.register(new URL('service-workers.js', import.meta.url), {type: 'module'}).then(
      (registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      (err) => {
        console.warn("ServiceWorker registration failed: ", err);
      }
    );
  });
}
