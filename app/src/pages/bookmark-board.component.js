import { h, Component } from "preact";
import { me, lang, router } from "/core";
import { MessagePreview } from "/message";

export default class BookmarkBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message: [],
    }
  }

  componentDidMount() {
    me.loadBookmarks().then(messages => this.setState({messages}));
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
