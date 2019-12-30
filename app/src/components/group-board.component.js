import { h, render, Component } from "preact";
import { cache, me, router, util } from "/core";
import { MessagePreview } from "/message";

export default class GroupBoard extends Component {

    constructor(props) {
        super(props);
        let groupId = util.getId(router.id);
        let loaded = 1 + Math.floor((window.screen.width * window.screen.height) / (320 * 215));
        this.state = {
            groupId: groupId,
            loaded: loaded,
            messages: [],
            scrollTop: 0,
            totalMessages: 0,
            pageYOffset: 0,
            page: 0,
        };
        this.scroll_cooldown = Date.now();
        this.onScroll = this.onScroll.bind(this);
        this.loadMessages = this.loadMessages.bind(this);
        window.addEventListener("resetCache", this.resetGroupDisplay);
    }

    componentDidMount() {
        this.loadMessages(0);
        window.addEventListener("scroll", this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    }

    getGroupName() {
        if (me.me.groups && router.entity.entityType == "group") {
            let group = me.me.groups.find(g => g["id"] == util.getId(router.entity));
            return group ? group["name"] : "";
        }
        return "";
    }

    loadMessages(page) {
        cache.get("/api/groups/" + this.state.groupId + "/page/" + page).then(res => {
            if(res && Array.isArray(res["messages"])) {
                let new_loaded = Math.max(this.state.loaded, page * 30);
                let msgList = this.state.messages;
                // don't add already added messages
                res["messages"].map(m => !msgList.find(msg => msg.id == m.id) && msgList.push(m));
                this.setState({
                    messages: msgList,
                    totalMessages: res["totalItems"],
                    page: page,
                    loaded: new_loaded,
                });
                if ((page + 1) * 30 < new_loaded) {
                    setTimeout(() => this.loadMessages(page + 1));
                }
            }
        });
    }

    onScroll() {
        // prevent loading messages if we are in a post
        if (window.getComputedStyle(document.getElementById("group").parentNode).display == "none") {
            return;
        }
        // don't load if on cooldown
        if (this.scroll_cooldown + 100 < Date.now()) {
            this.scroll_cooldown = Date.now();
            this.setState({pageYOffset: window.pageYOffset});
            // don't load if unecessary
            if (
                Array.isArray(this.state.messages)
                && document.body.scrollHeight - window.screen.height - 500 < window.pageYOffset
                && this.state.loaded < this.state.totalMessages
            ) {
                this.setState(prevState => ({loaded: prevState.loaded + 10}));
                if (this.state.loaded + 30 > this.state.messages.length) {
                    this.loadMessages(this.state.page + 1);
                    // update page count right away
                    this.setState(prevState => ({page: prevState.page + 1}));
                }
            }
        }
    }

    render() {
        return Array.isArray(this.state.messages) && (
            <div>
                <div class="group-name">{ this.getGroupName() }</div>
                <article id="group" class="justify-content-center d-flex">
                    <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                        { this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                            return (
                                <MessagePreview
                                    tabindex={i + 1}
                                    key={msg.id}
                                    message={msg}
                                    groupId={util.getId(router.id)}
                                />
                            );
                        })}
                    </div>
                </article>
            </div>
        );
    }
}
