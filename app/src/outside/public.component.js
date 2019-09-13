import { h, render, Component } from "preact";
import { http, router } from "/core";
import { Message } from "/message";

export default class Public extends Component {

    constructor() {
        super();
        this.state = {};
        if (router.id) {
            http.get("/api/public/" + router.id).then(res => this.setState({message: res}));
        }
    }

    render() {
        if (!this.state.message) {
            return;
        }
        return (
            <article class="justify-content-center d-flex">
                <div class="container">
                    <Message isPublic={true} key={this.state.message.id} message={this.state.message} />
                </div>
            </article>
        );
    }
}
