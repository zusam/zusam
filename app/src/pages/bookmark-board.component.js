import { h, Component } from "preact";
import { http, me, lang, router } from "/core";
import { MessagePreview } from "/message";

export default class BookmarkBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
    this.loadBookmarks = this.loadBookmarks.bind(this);
    // force update the navbar when me gets updated
    addEventListener("meStateChange", () => this.loadBookmarks());
  }

  loadBookmarks() {
    Promise.all(me.me.data?.bookmarks?.map(bid => {
      return http.get(`/api/messages/${bid}`);
    })).then(messages => this.setState({messages}));
  }

  componentDidMount() {
    this.loadBookmarks();
  }

  render() {
    return (
      Array.isArray(this.state.messages) && this.state.messages.length && (
        <div>
          <a
            href={router.toApp("/bookmarks")}
            onClick={e => router.onClick(e)}
            class="no-decoration"
          >
            <div class="group-name">{lang.t("bookmarks")}</div>
          </a>
          <article id="group" class="justify-content-center d-flex">
            <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
              {this.state.messages.map((msg, i) => {
                return (
                  <MessagePreview
                    tabindex={i + 1}
                    key={msg.id}
                    message={msg}
                    groupId={msg.group.id}
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
