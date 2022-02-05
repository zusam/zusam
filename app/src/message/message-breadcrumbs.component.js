import { h, Fragment } from "preact";
import { http, util } from "/src/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "preact/hooks";

export default function MessageBreadcrumbs(props) {

  const stack = [props.message.id, ...props.message.lineage].reverse();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [group, setGroup] = useState(null);

  const getTitle = (message, previewLink) => {
    if (message) {
      if (message["data"] && message["data"]["title"]) {
        return message["data"]["title"];
      }
      if (previewLink && previewLink["data"]) {
        return previewLink["data"]["title"];
      }
      if (message["data"] && message["data"]["text"]) {
        let url = util.getUrl(message["data"]["text"]);
        if (url && url.length > 0) {
          url = url[0];
        }
        if (url) {
          return url;
        }
        return message["data"]["text"];
      }
    }
    // When all else fails, just say who and when
    return `${message?.author?.name}, ${util.humanTime(message.createdAt)}`;
  };

  const loadBreadcrumbs = ids => {
    let breadcrumbs = [];
    Promise.all(ids.map(id => http.get(`/api/messages/${id}`))).then((messages) => {
      Promise.all(messages.map(message => {
        let previewUrl = util.getUrl(message?.data?.text);
        if (previewUrl) {
          return http.get(`/api/links/by_url?url=${encodeURIComponent(previewUrl[0])}`);
        }
        return Promise.resolve(null);
      })).then((links) => {
        for (let i = 0; i < ids.length; i++) {
          breadcrumbs[i] = getTitle(messages[i], links[i]);
        }
        setBreadcrumbs(breadcrumbs);
      });
    });
  };

  useEffect(() => {
    loadBreadcrumbs(stack);
    http.get(`/api/groups/${props.message.group.id}`).then(group => {
      setGroup(group);
    });
  }, []);

  if (stack.length > 0) {
    const stack_truncated = [stack[0], ...stack.slice(Math.min(3, stack.length) * -1).slice(1)];
    const breadcrumbs_truncated = [breadcrumbs[0], ...breadcrumbs.slice(Math.min(3, breadcrumbs.length) * -1).slice(1)];
    return (
      <div class="message-breadcrumbs">
        <nav style="--bs-breadcrumb-divider: '>';">
          <ol class="breadcrumb">
            {group && (
              <li class="breadcrumb-item">
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  class="no-decoration"
                >{util.limitLength(group.name || group.id.slice(0, 8), 30)}</Link>
              </li>
            )}
            {stack_truncated.map((e, i) => (
              <Fragment key={e}>
                <Fragment>
                  {i == 1 && stack.length > 3 && (
                    <li class="breadcrumb-item">...</li>
                  )}
                </Fragment>
                <li class="breadcrumb-item">
                  <Link
                    key={e}
                    to={`/messages/${e}`}
                    class="no-decoration"
                  >{util.limitLength(breadcrumbs_truncated[i] || e.slice(0, 8), 30)}</Link>
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      </div>
    );
  }
}
