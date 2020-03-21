import { Fragment, h, render, Component } from "preact";
import { lang, cache, http, me, router, util } from "/core";
import Message from "./message.component.js";

export default class MessageChild extends Component {
  constructor(props) {
    super(props);
    this.loadMessage = this.loadMessage.bind(this);
  }

  loadMessage(msg) {
    me.removeMatchingNotifications(msg.id);
    this.setState({
      message: msg,
      author: msg.author,
    });
  }

  componentDidMount() {
    this.loadMessage(this.props.message);
  }

  componentWillUpdate() {
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
      <Message
        message={this.state.message}
        isPublic={this.props.isPublic}
        isChild={true}
        preMessageHeadComponent={
          this.state.edit && me.me && (
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
          )
        }
      >
      </Message>
    );
  }
}
