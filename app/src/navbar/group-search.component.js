import { h, Component } from "preact";
import { lang, me, router, util, http } from "/core";
import { MessageSearchResult } from "/message";

export default class GroupSearch extends Component {
  constructor(props) {
    super(props);
    let groupId = util.getId(router.id);
    this.state = {
      groupId,
      loaded: false,
      messages: [],
      totalMessages: 0,
      search: "",
      hashtags: "",
    };
    this.loadMessages = this.loadMessages.bind(this);
  }

  getGroupName() {
    if (me.me.groups && router.entity.entityType == "group") {
      let group = me.me.groups.find(g => g["id"] == util.getId(router.entity));
      return group ? group["name"] : "";
    }
    return "";
  }

  componentWillUnmount() {
    window.removeEventListener("routerStateChange", this.loadMessages);
  }

  componentDidMount() {
    this.loadMessages();
    window.addEventListener("routerStateChange", this.loadMessages);
  }

  loadMessages() {
    const search = router.getParam("search").replace(/\+/g, " ");
    const hashtags = router.getParam("hashtags").replace(/\+/g, " ");
    this.setState({search, hashtags});
    http
      .post("/api/messages/search", {
        group: this.state.groupId,
        search,
        hashtags
      })
      .then(res => {
        if (res && Array.isArray(res["messages"])) {
          this.setState({
            search,
            messages: res["messages"],
            totalMessages: res["totalItems"],
            loaded: true
          });
        }
      });
  }

  render() {
    return (
      Array.isArray(this.state.messages) && (
        <div>
          <a
            href={router.toApp(`/groups/${  util.getGroupId()}`)}
            onClick={e => router.onClick(e)}
          >
            <div class="group-name no-decoration">{util.getGroupName()}</div>
          </a>
          <article id="group" class="justify-content-center d-flex">
            <div class="search-results-container container-fluid d-flex justify-content-center flex-wrap">
              {this.state.messages.length == 0 && !this.state.loaded && (
                <p>
                  <div class="mt-5 spinner orange-spinner">
                    <div /><div /><div /><div /><div />
                  </div>
                </p>
              )}
              {this.state.messages.length == 0 && this.state.loaded && (
                <p>{lang.t("search_without_result")}</p>
              )}
              {this.state.messages.map((msg, i) => {
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
