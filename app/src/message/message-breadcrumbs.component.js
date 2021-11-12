import { h, Component, Fragment } from "preact";
import { http, util } from "/src/core";
import { Link, withRouter } from "react-router-dom";
import { withTranslation } from 'react-i18next';

class MessageBreadcrumbs extends Component {

  buildStack(message, stack = []) {
    http.get(`/api/messages/${message.id}`).then(m => {
      let previewUrl = util.getUrl(m.data["text"]);
      if (previewUrl) {
        http.get(`/api/links/by_url?url=${encodeURIComponent(previewUrl[0])}`).then(preview => {
          m["preview"] = preview;
          stack.push(m);
          if (m?.parent) {
            this.buildStack(m.parent, stack);
          } else {
            http.get(`/api/groups/${m.group.id}`).then(g => {
              stack.push(g);
              stack = stack.reverse();
              this.setState({stack});
            });
          }
        });
      } else if (m?.author?.id) {
        http.get(`/api/users/${m?.author?.id}`).then(author => {
          m["author"] = author;
          stack.push(m);
          if (m?.parent) {
            this.buildStack(m.parent, stack);
          } else {
            http.get(`/api/groups/${m.group.id}`).then(g => {
              stack.push(g);
              stack = stack.reverse();
              this.setState({stack});
            });
          }
        });
      }
    });
  }

  componentDidMount() {
    this.buildStack({id: this.props.id});
  }

  getTitle(message) {
    if (message) {
      if (message['data'] && message['data']['title']) {
        return message['data']['title'];
      }
      if (message['preview'] && message['preview']['data']) {
        return message['preview']['data']['title'];
      }
      if (message['data'] && message['data']['text']) {
        let url = util.getUrl(message['data']['text']);
        if (url && url.length > 0) {
          url = url[0];
        }
        if (url) {
          return url;
        }
        return message['data']['text'];
      }
    }
    // When all else fails, just say who and when
    return `${message?.author?.name}, ${util.humanTime(message.createdAt)}`;
  }

  render() {
    if (this.state?.stack) {
      return (
        <div class="message-breadcrumbs">
          <nav style="--bs-breadcrumb-divider: '>';">
            <ol class="breadcrumb">
              {[this.state.stack[0], ...this.state.stack.slice(Math.min(3, this.state.stack.length) * -1).slice(1)].map((e, i) => e && e.id && (
                <Fragment>
                  <Fragment>
                    {i == 1 && this.state.stack.length > 3 && (
                      <li class="breadcrumb-item">...</li>
                    )}
                  </Fragment>
                  <li class="breadcrumb-item">
                    <Link
                      key={e.id}
                      to={`/${e.entityType}s/${e.id}`}
                      class="no-decoration"
                    >{util.limitLength((e.entityType == "message" ? this.getTitle(e) : e?.name) || e.id, 40)}</Link>
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        </div>
      );
    }
    return null;
  }
}

export default withTranslation()(withRouter(MessageBreadcrumbs));
