"use strict";
import { h, render, Component } from "preact";
import Message from "./message.component.js";
import GroupBoard from "./group-board.component.js";

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
        
		const segments = this.router.getSegments();
		switch (segments[0]) {
			case "messages":
				this.setState({
					show: "message",
					url: "/api/messages/" + segments[1],
				});
				break;
			case "groups":
				this.setState({
					show: "group",
					url: "/api/groups/" + segments[1],
				});
				break;
			default:
				console.log("unknown url");
		}
    }

    render() {
        return (
            <main>
                { this.state.show === "message" && this.state.url && <Message url={this.state.url} /> }
                { this.state.show === "group" && this.state.url && <GroupBoard url={this.state.url} /> }
            </main>
        );
    }
}

render(<App />, document.body);
