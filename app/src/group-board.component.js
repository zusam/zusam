import { h, render, Component } from "preact";
import bee from "./bee.js";
import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        this.state = {
            url: props.url,
            group: {},
            messages: [],
            loaded: Math.floor((window.screen.width * window.screen.height) / (320 * 180))
        };
        bee.get(props.url).then(
            res => {
                this.setState({group: res});
                bee.get("/api/groups/" + res.id + "/messages").then(res => this.setState({messages: res}));
            }
        );
    }

    loadMoreMessages() {
        const key = "loadMoreMessagesOnScroll";
        if (
            !window.sessionStorage.getItem(key)
            && window.scrollMaxY - 300 < window.scrollY
            && this.state.loaded < this.state.messages.length
        ) {
            window.sessionStorage.setItem(key, true);
            this.setState({loaded: this.state.loaded + 10});
            setTimeout(() => window.sessionStorage.removeItem(key), 500);
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", this.loadMoreMessages);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.loadMoreMessages);
    }

    render() {
        return !!this.state.messages && (
            <div class="message-container d-flex flex-wrap justify-content-center">
                { this.state.messages.slice(0, this.state.loaded).map(url => <MessagePreview key={url} url={url}/>) }
            </div>
        );
    }
}
