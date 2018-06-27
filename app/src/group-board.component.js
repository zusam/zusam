import { h, render, Component } from "preact";
import bee from "./bee.js";
import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        this.hardUpdate = this.hardUpdate.bind(this);
        this.state = {
            url: props.url,
            group: {},
            messages: [],
            loaded: 0,
            scrollTop: 0,
            totalMessages: 0,
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
            bee.get("/api/groups/" + group.id + "/messages?parent[exists]=0&page=1").then(res => {
                if(res && Array.isArray(res["hydra:member"])) {
                    this.setState({
                        messages: res["hydra:member"],
                        totalMessages: res["hydra:totalItems"]
                    });
                    // scrollTo the right place but leave a bit of time for the dom to construct
                    setTimeout(() => document.getElementById("group").scrollTo(0, scrollTop), 0);
                }
            });
        }));
    }

    hardUpdate() {
        bee.http.get("/api/groups/" + bee.getId(this.state.url) + "/messages?parent[exists]=0&page=1", "nocache").then(res => {
            if(res && Array.isArray(res["hydra:member"])) {
                this.setState({messages: [
                    ...res["hydra:member"],
                    ...this.state.messages.filter(m => res["hydra:member"].find(mm => mm.id == m.id))
                ]});
            }
        });
    }

    loadMoreMessages() {
        const key = "onScroll";
        const groupContainer = document.getElementById("group");
        if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, Date.now());
            return;
        }
        if (parseInt(window.sessionStorage.getItem(key)) + 100 < Date.now()) {
            window.sessionStorage.setItem(key, Date.now());
            bee.set("group_" + this.state.group.id, {
                loaded: this.state.loaded + 10,
                scrollTop: groupContainer.scrollTop
            }, Infinity, false);
            this.setState({scrollTop: groupContainer.scrollTop});
            if (
                Array.isArray(this.state.messages)
                && groupContainer.scrollHeight - window.screen.height - 500 < groupContainer.scrollTop
                && this.state.loaded < this.state.totalMessages
            ) {
                this.setState({loaded: this.state.loaded + 10});
                if (this.state.loaded + 30 > this.state.messages.length) {
                    bee.get("/api/groups/" + this.state.group.id + "/messages?parent[exists]=0&page=" + (this.state.page + 1)).then(res => {
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
                <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                    { this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                        return <MessagePreview tabindex={i + 1} key={msg.id} message={msg}/>;
                    })}
                </div>
            </article>
        );
    }
}
