import { h, render, Component } from "preact";
import { storage, me, router, util, http } from "/core";
import { MessageSearchResult } from "/message";

export default class GroupSearch extends Component {
  constructor(props) {
    super(props);
    let groupId = util.getId(router.id);
    let loaded =
      1 +
      Math.floor((window.screen.width * window.screen.height) / (320 * 215));
    this.state = {
      groupId: groupId,
      loaded: loaded,
      messages: [],
      totalMessages: 0,
      search: router.getParam("search").replace(/\+/g, " "),
      hashtags: router.getParam("hashtags").replace(/\+/g, " ")
    };
    this.loadMessages = this.loadMessages.bind(this);
    window.addEventListener("routerStateChange", _ => this.loadMessages());
  }

  getGroupName() {
    if (me.me.groups && router.entity.entityType == "group") {
      let group = me.me.groups.find(g => g["id"] == util.getId(router.entity));
      return group ? group["name"] : "";
    }
    return "";
  }

  componentDidMount() {
    this.loadMessages();
  }

  loadMessages() {
    let search = router.getParam("search").replace(/\+/g, " ");
    let hashtags = router
      .getParam("hashtags")
      .split("+")
      .join(" ");
    http
      .post("/api/messages/search", {
        group: this.state.groupId,
        search: search,
        hashtags: hashtags
      })
      .then(res => {
        if (res && Array.isArray(res["messages"])) {
          this.setState({
            search: search,
            messages: res["messages"],
            totalMessages: res["totalItems"],
            loaded: res.messages.length
          });
        }
      });
  }

  render() {
    return (
      Array.isArray(this.state.messages) && (
        <div>
          <a
            href={router.toApp("/groups/" + util.getGroupId())}
            onClick={e => router.onClick(e)}
          >
            <div class="group-name no-decoration">{util.getGroupName()}</div>
          </a>
          <article id="group" class="justify-content-center d-flex">
            <div class="search-results-container container-fluid d-flex justify-content-center flex-wrap">
              {this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                return (
                  <MessageSearchResult
                    tabindex={i + 1}
                    key={msg.id}
                    message={msg}
                    groupId={this.state.groupId}
                    search={this.state.search}
                    hashtags={this.state.hashtags}
                  />
                );
              })}
            </div>
          </article>
        </div>
      )
    );
  }
}
