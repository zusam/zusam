import { h, Component } from "preact";
import { util, me, http } from "/src/core";
import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";

function getAvatar(user) {
  return (
    <img
      title={user ? user.name : "--"}
      className={`avatar material-shadow${user ? "" : " removed-user"}`}
      style={util.backgroundHash(user ? user.id : "")}
      src={
        user?.avatar
          ? util.crop(user.avatar["id"], 100, 100)
          : util.defaultAvatar
      }
      onError={e => (e.currentTarget.src = util.defaultAvatar)}
    />
  );
}

export default class MessagePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      author: null,
      preview: null,
      id: null,
      data: null,
      lastActivityDate: null,
    };
  }

  componentDidMount() {
    http.get(`/api/messages/${this.props.id}/preview`).then(p => {
      this.setState({...p});
    });
  }

  render() {
    if (!this.state?.id) {
      return null;
    }
    return (
      <Link
        to={`/messages/${this.state.id}`}
        class="d-inline-block seamless-link message-preview unselectable"
        title={this.state?.data["title"]}
      >
        <div tabindex={this.props.tabindex} class="card material-shadow-with-hover">
          {getAvatar(this.state.author)}
          {this.state?.preview ? (
            <div
              class="card-miniature"
              style={
                `background-image: url('${util.crop(util.getId(this.state?.preview), 320, 180)}')`
              }
            />
          ) : (
            <div class="text-preview">{this.state?.data["text"]}</div>
          )}
          <div class="card-body border-top d-flex justify-content-between">
            <span class="left-buffer" />
            <span
              class="title"
              title={
                this.state?.data["title"] ||
                util.humanFullDate(this.state?.lastActivityDate)
              }
            >
              {this.state?.data["title"] ||
                util.humanTime(this.state?.lastActivityDate)}
            </span>
            <span class="children">
              {!!this.state?.children && (
                <span>
                  {`${this.state?.children} `}
                  <FaIcon
                    family={
                      me.isNew(this.state?.id) ? "solid" : "regular"
                    }
                    icon={"comment"}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    );
  }
}
