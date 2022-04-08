import { h, Component, Fragment } from "preact";
import { http } from "/src/core";
import { MessagePreview } from "/src/message";
import { useEffect, useState } from "preact/hooks";

export default function MessageList(props) {

  const [loaded, setLoaded] = useState(1 + Math.floor((window.screen.width * window.screen.height) / (320 * 215)));
  const [messages, setMessages] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [pageYOffset, setPageYOffset] = useState(0);
  const [page, setPage] = useState(0);
  const [group, setGroup] = useState(null);

  const onNewParent = () => {
    loadMessages(0);
  };

  const loadMessages = page => {
    http.get(`/api/groups/${props.id}`).then(res => {
      setGroup(res);
    });

    http
      .get(`/api/groups/${props.id}/page/${page}`)
      .then(res => {
        if (res && Array.isArray(res["messages"])) {
          let new_loaded = Math.max(loaded, page * 30);
          let msgList = messages;
          // don't add already added messages
          res["messages"].map(
            m => !msgList.find(msg => msg.id == m.id) && msgList.push(m)
          );
          setMessages(msgList);
          setTotalMessages(res["totalItems"]);
          setPage(page);
          setLoaded(new_loaded);
          if ((page + 1) * 30 < new_loaded) {
            setTimeout(() => loadMessages(page + 1));
          }
        }
      });
  };

  const onScroll = () => {
    // prevent loading messages if we are in a post
    if (
      window.getComputedStyle(document.getElementById("group").parentNode).display == "none"
    ) {
      return;
    }
    // don't load if on cooldown
    if (scroll_cooldown + 100 < Date.now()) {
      scroll_cooldown = Date.now();
      setPageYOffset(window.pageYOffset);
      // don't load if unecessary
      if (
        Array.isArray(messages) &&
        document.body.scrollHeight - window.screen.height - 500 < window.pageYOffset && loaded < totalMessages
      ) {
        setLoaded(loaded + 10);
        if (loaded + 30 > messages.length) {
          loadMessages(page + 1);
          // update page count right away
          setPage(page + 1)
        }
      }
    }
  };

  useEffect(() => {
    loadMessages(0);
    window.addEventListener("newParent", onNewParent);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!props.id) {
    return;
  }
  return (
    <Fragment>
      {Array.isArray(messages) && messages.slice(0, loaded).map((msg, i) => {
        return (
          <MessagePreview
            tabindex={i + 1}
            key={msg.id}
            id={msg.id}
          />
        );
      })}
    </Fragment>
  );
}
