import { h, Component } from "preact";
import { util, http, me } from "/src/core";
import { MessagePreview } from "/src/message";
import store from "/src/store";
import { Link } from "react-router-dom";
import { withTranslation } from 'react-i18next';

class BookmarkBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
    this.loadBookmarks = this.loadBookmarks.bind(this);
    store.on('@change', () => {
      this.loadBookmarks();
    })
  }

  loadBookmarks() {
    if (me.me && me.me.data && Array.isArray(me.me.data.bookmarks)) {
      Promise.all(me.me.data.bookmarks.map(bid => {
        return http.get(`/api/messages/${bid}`);
      })).then(messages => this.setState({messages}));
    }
  }

  componentDidMount() {
    this.loadBookmarks();
  }

  render() {
    if (!Array.isArray(this.state.messages) || this.state.messages.length < 1) {
      return;
    }
    return (
      <div>
        <Link to={util.toApp("/bookmarks")} class="no-decoration">
          <div class="group-name">{this.props.t("bookmarks")}</div>
        </Link>
        <article id="group" class="justify-content-center d-flex">
          <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
            {this.state.messages.filter(m => m?.id).map((msg, i) => {
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
    );
  }
}

export default withTranslation()(BookmarkBoard);
