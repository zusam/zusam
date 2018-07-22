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
            let loaded = 1 + Math.floor((window.screen.width * window.screen.height) / (320 * 215));
            let scrollTop = 0;
            if (groupData) {
                loaded = groupData.loaded || loaded;
                pageYOffset = groupData.pageYOffset || pageYOffset;
            }
            this.setState({
                group: group,
                loaded: loaded,
                pageYOffset: pageYOffset,
                page: 1,
            });
            bee.get("/api/groups/" + group.id + "/messages?parent[exists]=0&page=1").then(res => {
                if(res && Array.isArray(res["hydra:member"])) {
                    this.setState({
                        messages: res["hydra:member"],
                        totalMessages: res["hydra:totalItems"]
                    });
                    // scrollTo the right place but leave a bit of time for the dom to construct
                    setTimeout(() => window.scrollTo(0, pageYOffset), 0);
                }
            });
        }));
    }

    componentDidMount() {
        window.addEventListener("scroll", this.loadMoreMessages);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.loadMoreMessages);
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
        if (window.getComputedStyle(document.getElementById("group").parentNode).display == "none") {
            return;
        }
        const key = "onScroll";
        if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, Date.now());
            return;
        }
        if (parseInt(window.sessionStorage.getItem(key)) + 100 < Date.now()) {
            window.sessionStorage.setItem(key, Date.now());
            bee.set("group_" + this.state.group.id, {
                loaded: this.state.loaded,
                pageYOffset: window.pageYOffset
            }, Infinity, false);
            this.setState({pageYOffset: window.pageYOffset});
            if (
                Array.isArray(this.state.messages)
                && document.body.scrollHeight - window.screen.height - 500 < window.pageYOffset
                && this.state.loaded < this.state.totalMessages
            ) {
                this.setState({loaded: this.state.loaded + 10});
                if (this.state.loaded + 30 > this.state.messages.length) {
                    // update page count right away
                    this.setState({page: this.state.page + 1});
                    bee.get("/api/groups/" + this.state.group.id + "/messages?parent[exists]=0&page=" + (this.state.page + 1)).then(res => {
                        if(res && Array.isArray(res["hydra:member"])) {
                            this.setState({
                                messages: [...this.state.messages, ...res["hydra:member"]],
                            });
                        }
                    });
                }
            }
        }
    }

    render() {
        return Array.isArray(this.state.messages) && (
            <article id="group" class="justify-content-center d-flex">
                <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                    { this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                        return <MessagePreview tabindex={i + 1} key={msg.id} message={msg}/>;
                    })}
                </div>
            </article>
        );
    }
}
