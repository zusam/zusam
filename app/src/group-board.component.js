import { h, render, Component } from "preact";
import http from "./http.js";

import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            group: {},
            messages: [],
            loaded: 20,
        };
        http.get(props.url).then(
            res => {
                this.setState({group: res});
                http.get("/api/groups/" + res["id"] + "/messages").then(res => this.setState({messages: res}));
            }
        );
    }

    componentDidMount() {
        const key = "loadMoreMessagesOnScroll";
        window.addEventListener("scroll", () => {
            if (!window.sessionStorage.getItem(key)) {
                window.sessionStorage.setItem(key, true);
                if (window.scrollMaxY - 300 < window.scrollY && this.state.loaded < this.state.messages.length) {
                    this.setState({loaded: this.state.loaded + 10});
                }
                setTimeout(() => window.sessionStorage.removeItem(key), 500);
            }
        });
    }

    render() {
        return (
            <div id="messagesContainer" class="container d-flex flex-wrap justify-content-center">
                { this.state.messages.slice(0, this.state.loaded).map(url => <MessagePreview key={url} url={url}/>) }
            </div>
        );
    }
}
