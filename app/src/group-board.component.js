import { h, render, Component } from "preact";
import http from "./http.js";

import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            group: {},
            messages: []
        };
        http.get(props.url).then(
            res => {
                this.setState({group: res});
                http.get("/api/groups/" + res["id"] + "/messages").then(res => this.setState({messages: res.slice(0, 20)}));
            }
        );
    }

    render() {
        return (
            <div class="container d-flex flex-wrap">
                { this.state.messages.map(url => <MessagePreview url={url}/>) }
            </div>
        );
    }
}
