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
                http.get("/api/groups/" + res["id"] + "/messages").then(res => {
                    res.slice(0, 20).forEach((url, i) => http.get(url).then(m => {
                        this.setState({
                            messages: [
                                ...this.state.messages.slice(0, i),
                                m,
                                ...this.state.messages.slice(i+1)
                            ]
                        });
                    }));
                });
            }
        );
    }

    render() {
        return (
            <div class="container d-flex flex-wrap">
                { this.state.messages.map(message => <MessagePreview {...message} />) }
            </div>
        );
    }
}
