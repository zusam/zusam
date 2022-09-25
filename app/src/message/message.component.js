import { h, Fragment } from "preact";
import { http, router, util, notifications } from "/src/core";
import MessageChildren from "./message-children.component.js";
import MessageHead from "./message-head.component.js";
import MessageFooter from "./message-footer.component.js";
import MessageBody from "./message-body.component.js";
import MessageBreadcrumbs from "./message-breadcrumbs.component.js";
import { Writer } from "/src/writer";
import { useEffect, useState, useRef, useReducer } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStoreon } from "storeon/preact";

export default function Message(props) {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { me } = useStoreon("me");
  const [author, setAuthor] = useState(null);
  const [parent, setParent] = useState(null);
  const [files, setFiles] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [edit, setEdit] = useState(false);

  const [message, setMessage] = useState(null);
  const messageRef = useRef(message);
  const setMessageRef = message => {
    messageRef.current = message;
    setMessage(message);
  };

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    window.addEventListener("newChild", onNewChild);
    window.addEventListener("editMessage", onEditMessage);
    loadMessage();
    notifications.markAsRead(props.id);

    if (!props.isChild) {
      setTimeout(() => window.scrollTo(0, 0));
    }

    setTimeout(() => {
      if (props.id == router.action) {
        const msgElement = document.getElementById(props.id);
        if (msgElement) {
          msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
          setTimeout(() => msgElement.classList.remove("highlight"), 1000);
        }
      }
    }, 1000);
  }, []);

  const hydrateMessage = m => {
    setMessageRef(m);
    if (m?.author?.id) {
      http.get(`/api/users/${m.author.id}`).then(u => {
        setAuthor(u);
      });
    }
    if (m?.parent?.id) {
      http.get(`/api/messages/${m.parent.id}`).then(p => {
        setParent(p);
      });
    }
    // delay loading of files a little bit
    setTimeout(() => {
      if (m?.files?.length) {
        Promise.all(m.files.map(f => http.get(`/api/files/${f.id}`).then(f => f))).then(
          files => setFiles(files)
        );
      }
    }, 100);
  };

  const loadMessage = () => {
    if (props?.message) {
      setFiles(props.message?.files.map(f => ({id: f.id, status: "loading"})));
      hydrateMessage(props.message);
    } else if (props?.token) {
      http.get(`/api/public/${props.token}`).then(m => {
        setFiles(m?.files.map(f => ({id: f.id, status: "loading"})));
        hydrateMessage(m);
      });
    } else {
      http.get(`/api/messages/${props.id}`).then(m => {
        setFiles(m?.files.map(f => ({id: f.id, status: "loading"})));
        hydrateMessage(m);
      });
    }
  };

  const onNewChild = event => {
    if (!messageRef.current?.id) {
      return;
    }
    const newMsg = event.detail;
    if (newMsg?.parent && util.getId(newMsg?.parent) == props.id) {
      newMsg.author = me;
      let newChildren = messageRef?.current?.children ? [...messageRef.current.children, newMsg] : [newMsg];
      let newRef = Object.assign(
        messageRef.current,
        {
          children: newChildren
        },
      );
      setMessageRef(newRef);
      forceUpdate();
    }
  };

  const openPublicLink = async event => {
    event.preventDefault();
    let newTab = window.open("about:blank", "_blank");
    const res = await http.get(
      `/api/messages/${props.id}/get-public-link`
    );
    newTab.location = `${document.baseURI}public/${res.token}`;
  };

  const onEditMessage = event => {
    if (event.detail.id == props.id) {
      setEdit(false);
      hydrateMessage(event.detail);
      props.key = +Date.now();
    }
  };

  const getComponentClass = () => {
    let cn = "message";
    if (props.isChild) {
      cn += " child";
    }
    if (props.id == router.action) {
      cn += " highlight";
    }
    return cn;
  };

  const deleteMessage = event => {
    event.preventDefault();
    if (confirm(t("ask_delete_message"))) {
      http.delete(`/api/messages/${props.id}`).then(() => {
        if (props.isChild) {
          setIsRemoved(true);
        } else {
          navigate(`/groups/${message.group.id}`);
        }
      });
    }
  };

  const shareMessage = event => {
    event.preventDefault();
    navigate(`/share?message=${props.id}`);
  };

  const editMessage = event => {
    event.preventDefault();
    setEdit(true);
  };

  const publishInGroup = () => {
    http
      .put(`/api/messages/${props.id}`, {
        lastActivityDate: Math.floor(Date.now() / 1000),
        isInFront: true
      })
      .then(res => {
        if (!res) {
          alert.add(t("error"), "alert-danger");
          return;
        }
        navigate(`/groups/${message.group.id}`);
      });
  };

  const cancelEdit = event => {
    event.preventDefault();
    setEdit(false);
  };

  const displayWriter = (isChild, focus) => {
    return (
      <Writer
        cancel={edit ? cancelEdit : null}
        files={edit ? files : []}
        focus={focus || !!edit}
        group={message.group}
        messageId={edit ? props.id : null}
        parent={
          edit ? parent?.id : props.id
        }
        text={edit ? message.data["text"] : ""}
        title={edit ? message.data["title"] : ""}
        isChild={isChild}
      />
    );
  };

  if (isRemoved || !message) {
    // placeholder (to be able to target it)
    return (
      <div id={props.id} className="message" />
    );
  }

  return (
    <Fragment>
      {!props?.isChild && !props?.isPublic && (
        <MessageBreadcrumbs key={message?.id} message={message} />
      )}
      <div id={props.id} className={getComponentClass()}>
        {edit && displayWriter(props?.isChild)}
        {!edit && (
          <Fragment>
            {props.isChild && !props.isPublic && edit && (
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
              author={author}
              message={message}
              isPublic={props?.isPublic}
              isChild={props?.isChild}
            />
            <div class="main">
              <MessageBody
                message={message}
                files={files || []}
                isPublic={props?.isPublic}
                isChild={props?.isChild}
              />
              <MessageFooter
                author={author}
                message={message}
                editMessage={editMessage}
                deleteMessage={deleteMessage}
                shareMessage={shareMessage}
                publishInGroup={publishInGroup}
                openPublicLink={openPublicLink}
                isPublic={props?.isPublic}
                isChild={props?.isChild}
              />
            </div>
          </Fragment>
        )}
      </div>
      {props?.postMessageComponent}
      {!props?.isChild && !props?.isPublic && (
        <MessageChildren
          childMessages={message?.children}
          key={props.id}
          id={props.id}
        />
      )}
      {!edit && !props?.isPublic && !props?.isChild && (
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
          {displayWriter(true, props.focus)}
        </div>
      )}
    </Fragment>
  );
}
