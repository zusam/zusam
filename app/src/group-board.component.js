import { h, render, Component } from "preact";
import bee from "./bee.js";
import MessagePreview from "./message-preview.component.js";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            groupId: bee.getId(props.url)
        };
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        this.resetGroupDisplay = this.resetGroupDisplay.bind(this);
        this.loadStartMessages = this.loadStartMessages.bind(this);
        this.restoreScroll = this.restoreScroll.bind(this);
        window.addEventListener("resetCache", this.resetGroupDisplay);
        this.resetGroupDisplay();
    }

    componentDidMount() {
        window.addEventListener("scroll", this.loadMoreMessages);
        // update timestamp of last visit of the group
        bee.set("group_" + this.state.groupId, {timestamp: Math.floor(Date.now()/1000)}).then(
            r => {
                window.dispatchEvent(new CustomEvent("viewGroup", {detail : {
                    from: "group-board",
                    data: this.state.groupId
                }}));
            }
        );
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.loadMoreMessages);
    }

    resetGroupDisplay(resetScroll = false, nocache = false) {
        this.setState({
            messages: [],
            loaded: 0,
            scrollTop: 0,
            totalMessages: 0,
        });
        bee.get("group_" + this.state.groupId).then(groupData => {
            let loaded = 1 + Math.floor((window.screen.width * window.screen.height) / (320 * 215));
            let scrollTop = 0;
            if (groupData) {
                loaded = groupData.loaded || loaded;
                pageYOffset = groupData.pageYOffset || pageYOffset;
            }
            if (resetScroll) {
                pageYOffset = 0;
            }
            this.setState({
                loaded: loaded,
                pageYOffset: pageYOffset,
                page: 0,
            });
            this.loadStartMessages(0, nocache);
        });
    }

    loadStartMessages(page, nocache = false) {
        if (!this.state.groupId) {
            return;
        }
        bee.get("/api/groups/" + this.state.groupId + "/page/" + page, nocache).then(res => {
            if(res && Array.isArray(res["messages"])) {
                let loaded = Math.max(this.state.loaded, page * 30);
                this.setState({
                    messages: [...this.state.messages, ...res["messages"]],
                    totalMessages: res["totalItems"],
                    page: page,
                    loaded: loaded,
                });
                if (page * 30 < loaded) {
                    setTimeout(() => this.loadStartMessages(page + 1, nocache), 0);
                }
            }
        });
    }

    loadMoreMessages() {
        // prevent loading messages if we are in a post
        if (window.getComputedStyle(document.getElementById("group").parentNode).display == "none") {
            return;
        }
        // set a cooldown on message loading
        const key = "onScroll";
        if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, Date.now());
            return;
        }
        if (parseInt(window.sessionStorage.getItem(key)) + 100 < Date.now()) {
            window.sessionStorage.setItem(key, Date.now());
            bee.set("group_" + this.state.groupId, {
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
                    bee.get("/api/groups/" + this.state.groupId + "/page/" + (this.state.page + 1)).then(res => {
                        if(res && Array.isArray(res["messages"])) {
                            this.setState({
                                messages: [...this.state.messages, ...res["messages"]],
                            });
                        }
                    });
                    // update page count right away
                    this.setState({page: this.state.page + 1});
                }
            }
        }
    }

    restoreScroll() {
        // scrollTo the right place but leave a bit of time for the dom to construct
        setTimeout(() => window.scrollTo(0, this.state.pageYOffset), 0);
    }

    render() {
        return Array.isArray(this.state.messages) && (
            <article id="group" class="justify-content-center d-flex">
                <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                    { this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                        return <MessagePreview tabindex={i + 1} key={msg.id} message={msg} currentUser={this.props.currentUser}/>;
                    })}
                </div>
            </article>
        );
    }
}
