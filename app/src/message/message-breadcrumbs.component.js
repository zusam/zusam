import { h, Component, Fragment } from "preact";
import { cache, util } from "/src/core";
import { Link, withRouter } from "react-router-dom";

class MessageBreadcrumbs extends Component {

  buildStack(message, stack = []) {
    cache.fetch(`/api/messages/${message.id}`).then(m => {
      stack.push(m);
      if (m?.parent) {
        this.buildStack(m.parent, stack);
      } else {
        cache.fetch(`/api/groups/${m.group.id}`).then(g => {
          stack.push(g);
          stack = stack.reverse();
          this.setState({stack});
        });
      }
    });
  }

  componentDidMount() {
    this.buildStack({id: this.props.id});
  }

  getTitle(message) {
      if (message && message['data']) {
        if (message['data']['title']) {
          return message['data']['title'];
        }
        if (message['data']['text']) {
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
      return "";
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

export default withRouter(MessageBreadcrumbs);
