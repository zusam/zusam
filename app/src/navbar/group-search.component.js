import { h, Component } from "preact";
import { router, util, http } from "/src/core";
import { MessageSearchResult } from "/src/message";
import { withTranslation } from "react-i18next";

class GroupSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupId: props.id,
      loaded: false,
      messages: [],
      search: "",
      hashtags: "",
    };
    this.loadMessages = this.loadMessages.bind(this);
  }

  getGroupName() {
    if (this.props.me.groups && router.entity.entityType == "group") {
      let group = this.props.me.groups.find(g => g["id"] == util.getId(router.entity));
      return group ? group["name"] : "";
    }
    return "";
  }

  componentWillUnmount() {
    window.removeEventListener("groupSearch", this.loadMessages);
  }

  componentDidMount() {
    this.loadMessages();
    window.addEventListener("groupSearch", this.loadMessages);
  }

  loadMessages() {
    const search = router.getParam("q");
    const hashtags = router.getParam("hashtags");
    this.setState({
      search,
      hashtags,
      loaded: false,
      messages: [],
    });
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
            loaded: true
          });
        }
      });
  }

  render() {
    return (
      Array.isArray(this.state.messages) && (
        <div>
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
                <p>{this.props.t("search_without_result")}</p>
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

export default withTranslation()(GroupSearch);
