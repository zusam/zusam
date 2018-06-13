import { h, render, Component } from "preact";
import bee from "./bee.js";
import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        if (this.state.messages && this.state.messages.length > 0) {
            return;
        }
        this.state = {
            url: props.url,
            group: {},
            messages: [],
            loaded: 0,
            scrollTop: 0,
        };
        bee.get(props.url).then(group => group && bee.get("group_" + group.id).then(groupData => {
            let loaded = Math.floor((window.screen.width * window.screen.height) / (320 * 215));
            let scrollTop = 0;
            if (groupData) {
                loaded = groupData.loaded || loaded;
                scrollTop = groupData.scrollTop || scrollTop;
            }
            this.setState({
                group: group,
                loaded: loaded,
                scrollTop: scrollTop,
                page: 1,
            });
            bee.get("/api/groups/" + group.id + "/messages?page=1").then(res => {
                if(res && Array.isArray(res["hydra:member"])) {
                    this.setState({messages: res["hydra:member"]});
                    // scrollTo the right place but leave a bit of time for the dom to construct
                    setTimeout(() => document.getElementById("group").scrollTo(0, scrollTop), 0);
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
        if (parseInt(window.sessionStorage.getItem(key)) + 300 < Date.now()) {
            window.sessionStorage.setItem(key, Date.now());
            bee.set("group_" + this.state.group.id, {
                loaded: this.state.loaded + 10,
                scrollTop: groupContainer.scrollTop
            }, Infinity, false);
            this.setState({scrollTop: groupContainer.scrollTop});
            if (
                Array.isArray(this.state.messages)
                && groupContainer.scrollHeight - window.screen.height - 400 < groupContainer.scrollTop
                && this.state.loaded < this.state.messages.length
            ) {
                this.setState({loaded: this.state.loaded + 10});
                if (this.state.loaded + 30 > this.state.messages.length) {
                    bee.get("/api/groups/" + this.state.group.id + "/messages?page=" + (this.state.page + 1)).then(res => {
                        if(res && Array.isArray(res["hydra:member"])) {
                            this.setState({
                                messages: [...this.state.messages, ...res["hydra:member"]],
                                page: this.state.page + 1,
                            });
                        }
                    });
                }
            }
        }
    }

    render() {
        return Array.isArray(this.state.messages) && (
            <article id="group" class="justify-content-center d-flex" onScroll={this.loadMoreMessages}>
                <div class="message-container flex-wrap justify-content-center d-flex">
                    { this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                        return <MessagePreview tabindex={i + 1} key={msg.id} message={msg}/>;
                    })}
                </div>
            </article>
        );
    }
}
