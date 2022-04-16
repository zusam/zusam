import { h, Fragment } from "preact";
import { util, notifications, http } from "/src/core";
import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";
import { HumanTime } from "/src/pages";
import { useEffect, useState } from "preact/hooks";

export default function MessagePreview(props) {

  const [author, setAuthor] = useState(null);
  const [preview, setPreview] = useState(null);
  const [id, setId] = useState(null);
  const [data, setData] = useState(null);
  const [lastActivityDate, setLastActivityDate] = useState(null);
  const [children, setChildren] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const getAvatar = user => {
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
  };

  useEffect(() => {
    http.get(`/api/messages/${props.id}/preview`).then(p => {
      setAuthor(p?.author);
      setPreview(p?.preview);
      setId(p?.id);
      setChildren(p?.children);
      setLoaded(true);
      setLastActivityDate(p?.lastActivityDate);
      setData(p?.data);
    });
  }, []);

  if (!props?.id || !data) {
    return null;
  }
  return (
    <Link
      to={`/messages/${id}`}
      class="d-inline-block seamless-link message-preview unselectable"
      title={data?.title}
    >
      <div tabindex={props?.tabindex} class="card material-shadow-with-hover">
        {getAvatar(author)}
        <div class="card-miniature-loading">
          {loaded && (
            <Fragment>
              {preview ? (
                <div
                  class="card-miniature"
                  style={
                    `background-image: url('${util.crop(util.getId(preview), 320, 180)}')`
                  }
                />
              ) : (
                <div class="text-preview">{data?.text}</div>
              )}
            </Fragment>
          )}
        </div>
        <div class="card-body border-top d-flex justify-content-between">
          <span class="left-buffer" />
          <span
            class="title"
            title={
              data?.title || util.humanFullDate(lastActivityDate)
            }
          >
            {data?.title || (<HumanTime timestamp={lastActivityDate} />)}
          </span>
          <span class="children">
            {children > 0 && (
              <span>
                {`${children} `}
                <FaIcon
                  family={
                    notifications.isNew(id) ? "solid" : "regular"
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
