import { h, render, Component } from "preact";
import bee from "./bee.js";
import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        if (!props.displayed) {
            return;
        }
        this.state = {
            url: props.url,
            group: {},
            messages: [],
            loaded: 0,
            scrollTop: 0,
        };
        bee.get(props.url).then(res => res && bee.get("group_" + res.id).then(groupData => {
            let loaded = Math.floor((window.screen.width * window.screen.height) / (320 * 180));
            let scrollTop = 0;
            if (groupData) {
                loaded = groupData.loaded || loaded;
                scrollTop = groupData.scrollTop || scrollTop;
            }
            this.setState({
                group: res,
                loaded: loaded,
                scrollTop: scrollTop
            });
            bee.get("/api/groups/" + res.id + "/messages").then(res => {
                if(Array.isArray(res)) {
                    this.setState({messages: res});
                    // scrollTo the right place but leave a bit of time for the dom to construct
                    setTimeout(() => document.getElementById("group").scrollTo(0, scrollTop), 50);
                }
            });
        }));
    }

    loadMoreMessages() {
        const key = "onScroll";
        const groupContainer = document.getElementById("group");
        if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, Date.now());
            return;
        }
        if (parseInt(window.sessionStorage.getItem(key)) + 500 < Date.now()) {
            window.sessionStorage.setItem(key, Date.now());
            bee.set("group_" + this.state.group.id, {
                loaded: this.state.loaded + 10,
                scrollTop: groupContainer.scrollTop
            }, Infinity, false);
            this.setState({scrollTop: groupContainer.scrollTop});
            if (
                Array.isArray(this.state.messages)
                && this.props.displayed
                && groupContainer.scrollHeight - window.screen.height - 300 < groupContainer.scrollTop
                && this.state.loaded < this.state.messages.length
            ) {
                this.setState({loaded: this.state.loaded + 10});
            }
        }
    }

    render() {
        return Array.isArray(this.state.messages) && (
            <article id="group" class={"justify-content-center " + (this.props.displayed ? "d-flex" : "d-none")} onScroll={this.loadMoreMessages}>
                <div class="message-container flex-wrap justify-content-center d-flex">
                    { this.state.messages.slice(0, this.state.loaded).map(url => <MessagePreview key={url} url={url}/>) }
                </div>
            </article>
        );
    }
}
