"use strict";
import { h, render, Component } from "preact";
import http from "./http.js";
import MessageCard from "./message-card.component.js";
// import "babel-polyfill";

class App extends Component {

    constructor() {
        super();
        this.state = {
            show: null,
            url: null,
        }

        this.router = {
            getSegments: () => window.location.pathname.slice(1).split("/")
        }
    }

    syncWithRoute() {
        const segments = this.router.getSegments();
        if (segments[0] === "messages" && segments[1]) {
            this.setState({
                show: "message",
                url: "/api/" + segments[0] + "/" + segments[1],
            });
        }
    }

    render() {
        return (
            <div>
                { this.state.show === "message" && this.state.url && <MessageCard url={this.state.url} /> }
            </div>
        );
    }

    componentDidMount() {
        this.syncWithRoute();
    }
}

render(<App />, document.body);
