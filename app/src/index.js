import { h, render } from "preact";
import App from "./app.js";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { StoreContext } from "storeon/preact";
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
