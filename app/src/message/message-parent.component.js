import { Fragment, h, render, Component } from "preact";
import { lang, cache, http, me, router, util } from "/core";
import MessageChildren from "./message-children.component.js";
import Message from "./message.component.js";

export default class MessageParent extends Component {
  constructor(props) {
    super(props);
    this.loadMessage = this.loadMessage.bind(this);
    this.openPublicLink = this.openPublicLink.bind(this);
    this.onNewChild = this.onNewChild.bind(this);

    window.addEventListener("newChild", this.onNewChild);

    let url = router.entityUrl;
    if (!url && props.message) {
      url = "/api/message/" + props.message.id;
    }
    this.state = { url: url };
  }

  componentDidMount() {
    if (this.props.message) {
      this.loadMessage(this.props.message);
    } else {
      cache.get(this.state.url).then(msg => this.loadMessage(msg));
    }
    setTimeout(() => window.scrollTo(0, 0));
  }

  loadMessage(msg) {
    if (!msg) {
      return;
    }
    me.removeMatchingNotifications(msg.id);
    let firstDisplayedChild = null;
    let lastDisplayedChild = null;
    if (msg.children.length) {
      let msgIndex = router.action
        ? msg.children.findIndex(e => e && e.id === router.action)
        : -1;
      if (msgIndex != -1) {
        firstDisplayedChild = Math.max(0, msgIndex - 1);
        lastDisplayedChild = Math.min(msg.children.length, msgIndex + 1);
      } else {
        firstDisplayedChild = msg.children && msg.children.length - 5; // display the last 5 children
        lastDisplayedChild = msg.children && msg.children.length;
      }
    }
    this.setState({
      message: msg,
      author: msg.author,
      firstDisplayedChild: firstDisplayedChild,
      lastDisplayedChild: lastDisplayedChild
    });
  }

  async openPublicLink(event) {
    event.preventDefault();
    let newTab = window.open("about:blank", "_blank");
    const res = await http.get(
      "/api/messages/" + this.state.message["id"] + "/get-public-link"
    );
    newTab.location = window.origin + "/public/" + res.token;
  }

  onNewChild(event) {
    const newMsg = event.detail;
    let msg = this.state.message;
    if (newMsg.parent && util.getId(newMsg.parent) == msg["id"]) {
      newMsg.author = me.me;
      msg.children = [...msg.children, newMsg];
      this.setState(prevState => ({
        lastDisplayedChild: prevState.lastDisplayedChild + 1,
        message: msg
      }));
    }
  }

  render() {
    // don't display the message if not loaded or removed
    if (!this.state.message || this.state.isRemoved) {
      return;
    }

    return (
      <Message
        message={this.state.message}
        isPublic={this.props.isPublic}
        isChild={false}
        postMessageComponent={
          <Fragment>
            <MessageChildren
              children={this.state.message.children}
              firstDisplayedChild={this.state.firstDisplayedChild}
              lastDisplayedChild={this.state.lastDisplayedChild}
              displayPreviousChildren={_ =>
                this.setState(prevState => ({
                  firstDisplayedChild: Math.max(
                    0,
                    prevState.firstDisplayedChild - 10
                  )
                }))
              }
              displayNextChildren={_ =>
                this.setState(prevState => ({
                  lastDisplayedChild: Math.min(
                    this.state.message.children,
                    prevState.lastDisplayedChild + 10
                  )
                }))
              }
              isPublic={this.props.isPublic}
              key={this.state.message.id}
            />
          </Fragment>
        }
      >
      </Message>
    );
  }
}
