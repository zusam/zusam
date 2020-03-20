import { Fragment, h, render, Component } from "preact";
import { lang, cache, http, me, router, util } from "/core";
import { FaIcon } from "/misc";
import MessageHead from "./message-head.component.js";
import MessageFooter from "./message-footer.component.js";
import MessageBody from "./message-body.component.js";
import MessageChildren from "./message-children.component.js";
import Writer from "./writer.component.js";

export default class MessageChild extends Component {
  constructor(props) {
    super(props);
    this.loadMessage = this.loadMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.shareMessage = this.shareMessage.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.onEditMessage = this.onEditMessage.bind(this);
    this.processEmbed = this.processEmbed.bind(this);
    this.publishInGroup = this.publishInGroup.bind(this);

    window.addEventListener("editMessage", this.onEditMessage);

    let url = router.entityUrl;
    if (!url && props.message) {
      url = "/api/message/" + props.message.id;
    }

    this.state = { url: url, preview: null };
  }

  loadMessage(msg) {
    me.removeMatchingNotifications(msg.id);
    this.setState({
      message: msg,
      author: msg.author,
    });
    setTimeout(this.processEmbed);
  }

  cancelEdit(event) {
    event.preventDefault();
    this.setState({ edit: false });
  }

  deleteMessage(event) {
    event.preventDefault();
    if (confirm(lang.t("ask_delete_message"))) {
      http.delete("/api/messages/" + this.state.message["id"]);
      cache.resetCache();
      // give some time to the cache to delete itself properly
      setTimeout(() => this.setState({ isRemoved: true }), 100);
    }
  }

  publishInGroup() {
    http
      .put("/api/messages/" + this.state.message.id, {
        lastActivityDate: Math.floor(Date.now() / 1000),
        isInFront: true
      })
      .then(res => {
        if (!res) {
          alert.add(lang.t("error"), "alert-danger");
          return;
        }
        router.navigate("/groups/" + this.state.message.group.id);
      });
  }

  shareMessage(event) {
    event.preventDefault();
    router.navigate("/share?message=" + this.state.message.id);
  }

  editMessage(event) {
    event.preventDefault();
    this.setState({ edit: true });
  }

  onEditMessage(event) {
    if (event.detail.id == this.state.message.id) {
      this.props.key = +Date.now();
      let msg = this.state.message;
      msg.data = event.detail.data;
      msg.files = event.detail.files;
      this.setState({
        message: msg,
        data: msg.data,
        gotPreview: false
      });
      setTimeout(_ => this.setState({ edit: false }));
    }
  }

  displayWriter(isChild) {
    return (
      <Writer
        cancel={this.state.edit ? this.cancelEdit : null}
        files={this.state.edit ? this.state.message.files : []}
        focus={!!this.state.edit}
        group={this.state.message.group}
        messageId={this.state.edit ? this.state.message.id : null}
        parent={
          this.state.edit ? this.state.message["parent"] : this.state.message.id
        }
        text={this.state.edit ? this.state.message.data["text"] : ""}
        title={this.state.edit ? this.state.message.data["title"] : ""}
        isChild={isChild}
      />
    );
  }

  componentDidMount() {
    if (this.props.message) {
      this.loadMessage(this.props.message);
    } else {
      cache.get(url).then(msg => this.loadMessage(msg));
    }
    setTimeout(() => window.scrollTo(0, 0));
  }

  processEmbed() {
    if (this.state.message && this.state.message.data) {
      let previewUrl = util.getUrl(this.state.message.data["text"]);
      if (previewUrl) {
        cache
          .get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0]))
          .then(r => {
            this.setState({ preview: r, gotPreview: true });
          });
      } else {
        this.setState({ gotPreview: true });
      }
    }
  }

  componentWillUpdate() {
    if (!this.state.gotPreview) {
      this.processEmbed();
    }
    if (this.state.message) {
      let msgElement = document.getElementById(this.state.message.id);
      if (
        this.state.message.id == router.action &&
        msgElement.classList.contains("highlight")
      ) {
        setTimeout(_ => {
          msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
          setTimeout(_ => msgElement.classList.remove("highlight"), 1000);
        }, 1000);
      }
    }
  }

  render() {
    if (!this.state.message || this.state.isRemoved) {
      return;
    }
    return (
      <div>
        <div
          id={this.state.message && this.state.message.id}
          className={
            "message child" +
            (this.state.message.id == router.action ? " highlight" : "")
          }
        >
          {this.state.edit && me.me && (
            <div class="message-head d-none d-md-block">
              <img
                class="rounded-circle w-3 material-shadow avatar"
                style={util.backgroundHash(me.me.id)}
                src={
                  me.me.avatar
                    ? util.crop(me.me.avatar["id"], 100, 100)
                    : util.defaultAvatar
                }
              />
            </div>
          )}
          {this.state.edit && this.displayWriter(true)}
          {!this.state.edit && (
            <Fragment>
              <MessageHead
                author={this.state.author}
                message={this.state.message}
                isPublic={this.props.isPublic}
                isChild={true}
              />
              <div class="main">
                <MessageBody
                  message={this.state.message}
                  isPublic={this.props.isPublic}
                  isChild={true}
                />
                <MessageFooter
                  author={this.state.author}
                  message={this.state.message}
                  editMessage={this.editMessage}
                  deleteMessage={this.deleteMessage}
                  shareMessage={this.shareMessage}
                  publishInGroup={this.publishInGroup}
                  isPublic={this.props.isPublic}
                  isChild={true}
                />
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
