import { h, Fragment, Component } from "preact";
import { http, router, util, me, notifications } from "/src/core";
import MessageChildren from "./message-children.component.js";
import MessageHead from "./message-head.component.js";
import MessageFooter from "./message-footer.component.js";
import MessageBody from "./message-body.component.js";
import MessageBreadcrumbs from "./message-breadcrumbs.component.js";
import { Writer } from "/src/writer";
import { withTranslation } from 'react-i18next';
import { connectStoreon } from 'storeon/preact';

class Message extends Component {

  constructor(props) {
    super(props);
    this.getComponentClass = this.getComponentClass.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.shareMessage = this.shareMessage.bind(this);
    this.publishInGroup = this.publishInGroup.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.onEditMessage = this.onEditMessage.bind(this);
    this.openPublicLink = this.openPublicLink.bind(this);
    this.onNewChild = this.onNewChild.bind(this);
    this.loadMessage = this.loadMessage.bind(this);
    this.hydrateMessage = this.hydrateMessage.bind(this);
    window.addEventListener("newChild", this.onNewChild);
    window.addEventListener("editMessage", this.onEditMessage);
  }

  hydrateMessage(m) {
    if (m?.author?.id) {
      http.get(`/api/users/${m.author.id}`).then(u => {
        this.setState({author: u});
      });
    }
    if (m?.parent?.id) {
      http.get(`/api/messages/${m.parent.id}`).then(p => {
        this.setState({parent: p});
      });
    }
    if (m?.files?.length) {
      Promise.all(m.files.map(f => http.get(`/api/files/${f.id}`).then(f => f))).then(
        files => this.setState({files})
      );
    }
    this.setState({message: m});
  }

  loadMessage() {
    if (this.props?.message) {
      this.hydrateMessage(this.props.message);
    } else if (this.props?.token) {
      http.get(`/api/public/${this.props.token}`).then(m => {
        this.hydrateMessage(m);
      });
    } else {
      http.get(`/api/messages/${this.props.id}`).then(m => {
        this.hydrateMessage(m);
      });
    }
  }

  componentDidMount() {
    this.loadMessage();
    notifications.removeMatchingNotifications(this.props.id);

    if (!this.props.isChild) {
      setTimeout(() => window.scrollTo(0, 0));
    }

    setTimeout(() => {
      if (this.props.id == router.action) {
        const msgElement = document.getElementById(this.props.id);
        if (msgElement) {
          msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
          setTimeout(() => msgElement.classList.remove("highlight"), 1000);
        }
      }
    }, 1000);
  }

  onNewChild(event) {
    const newMsg = event.detail;
    let msg = this.state.message;
    if (newMsg.parent && util.getId(newMsg.parent) == msg.id) {
      newMsg.author = me.get();
      msg.children = [...msg.children, newMsg];
      this.setState({message: msg});
    }
  }

  async openPublicLink(event) {
    event.preventDefault();
    let newTab = window.open("about:blank", "_blank");
    const res = await http.get(
      `/api/messages/${this.props.id}/get-public-link`
    );
    newTab.location = `${document.baseURI}public/${res.token}`;
  }

  onEditMessage(event) {
    if (event.detail.id == this.props.id) {
      this.setState({
        edit: false,
      });
      this.hydrateMessage(event.detail)
      this.props.key = +Date.now();
    }
  }

  getComponentClass() {
    let cn = "message";
    if (this.props.isChild) {
      cn += " child";
    }
    if (this.props.id == router.action) {
      cn += " highlight";
    }
    return cn;
  }

  deleteMessage(event) {
    event.preventDefault();
    if (confirm(this.props.t("ask_delete_message"))) {
      http.delete(`/api/messages/${this.props.id}`).then(() => {
        if (this.props.isChild) {
          this.setState({isRemoved: true});
        } else {
          // dirty hack before converting this component to a function
          window.location.href = `/groups/${this.state.message.group.id}`;
        }
      });
    }
  }

  shareMessage(event) {
    event.preventDefault();
    this.props.history.push(`/share?message=${this.props.id}`);
  }

  editMessage(event) {
    event.preventDefault();
    this.setState({ edit: true });
  }

  publishInGroup() {
    http
      .put(`/api/messages/${this.props.id}`, {
        lastActivityDate: Math.floor(Date.now() / 1000),
        isInFront: true
      })
      .then(res => {
        if (!res) {
          alert.add(this.props.t("error"), "alert-danger");
          return;
        }
        this.props.history.push(`/groups/${this.state.message.group.id}`);
      });
  }

  cancelEdit(event) {
    event.preventDefault();
    this.setState({ edit: false });
  }

  displayWriter(isChild, focus) {
    return (
      <Writer
        cancel={this.state.edit ? this.cancelEdit : null}
        files={this.state.edit ? this.state?.files : []}
        focus={focus || !!this.state.edit}
        group={this.state.message.group}
        messageId={this.state.edit ? this.props.id : null}
        parent={
          this.state.edit ? this.state?.parent?.id : this.props.id
        }
        text={this.state.edit ? this.state.message.data["text"] : ""}
        title={this.state.edit ? this.state.message.data["title"] : ""}
        isChild={isChild}
      />
    );
  }

  render() {
    if (this.state?.isRemoved || !this.state?.message) {
      // placeholder (to be able to target it)
      return (
        <div id={this.props.id} className="message" />
      );
    }
    return (
      <Fragment>
        {!this.props?.isChild && !this.props?.isPublic && (
          <MessageBreadcrumbs id={this.props.id} />
        )}
        <div id={this.props.id} className={this.getComponentClass()}>
          {this.state?.edit && this.displayWriter(this.props?.isChild)}
          {!this.state?.edit && (
            <Fragment>
              {this.props.isChild && !this.props.isPublic && this.state?.edit && (
                <div class="message-head d-none d-md-block">
                  <img
                    class="rounded-circle w-3 material-shadow avatar"
                    style={util.backgroundHash(me.id)}
                    src={
                      me.avatar
                        ? util.crop(me.avatar?.id, 100, 100)
                        : util.defaultAvatar
                    }
                  />
                </div>
              )}
              <MessageHead
                author={this.state?.author}
                message={this.state?.message}
                isPublic={this.props?.isPublic}
                isChild={this.props?.isChild}
              />
              <div class="main">
                <MessageBody
                  message={this.state?.message}
                  files={this.state?.files || []}
                  isPublic={this.props?.isPublic}
                  isChild={this.props?.isChild}
                />
                <MessageFooter
                  author={this.state?.author}
                  message={this.state?.message}
                  editMessage={this.editMessage}
                  deleteMessage={this.deleteMessage}
                  shareMessage={this.shareMessage}
                  publishInGroup={this.publishInGroup}
                  openPublicLink={this.openPublicLink}
                  isPublic={this.props?.isPublic}
                  isChild={this.props?.isChild}
                />
              </div>
            </Fragment>
          )}
        </div>
        {this.props?.postMessageComponent}
        {!this.props?.isChild && !this.props?.isPublic && (
          <MessageChildren
            childMessages={this.state.message?.children}
            isPublic={this.props?.isPublic}
            key={this.props.id}
            id={this.props.id}
          />
        )}
        {!this.state?.edit && !this.props?.isPublic && !this.props?.isChild && (
          <div class="message child mt-2">
            {me?.id && (
              <div class="message-head d-none d-md-block">
                <img
                  class="rounded-circle w-3 material-shadow avatar"
                  style={util.backgroundHash(me.id)}
                  src={
                    me?.avatar
                      ? util.crop(me.avatar["id"], 100, 100)
                      : util.defaultAvatar
                  }
                />
              </div>
            )}
            {this.displayWriter(true, this.props.focus)}
          </div>
        )}
      </Fragment>
    );
  }
}

export default connectStoreon('me', withTranslation()(Message));
