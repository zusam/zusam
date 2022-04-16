import { h } from "preact";
import { router, http } from "/src/core";
import { MessageSearchResult } from "/src/message";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";

export default function GroupSearch(props) {

  const { t } = useTranslation();
  const groupId = useState(props.id);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [messages, setMessages] = useState([]);

  const loadMessages = () => {
    const search = router.getParam("q");
    const hashtags = router.getParam("hashtags");
    setSearch(search);
    setHashtags(hashtags);
    setLoaded(false);
    setMessages([]);
    http.post("/api/messages/search", {
      group: groupId,
      search,
      hashtags
    }).then(res => {
      if (res && Array.isArray(res["messages"])) {
        setSearch(search);
        setMessages(res["messages"]);
        setLoaded(true);
      }
    });
  };

  useEffect(() => {
    loadMessages();
    window.addEventListener("groupSearch", loadMessages);
    return () => {
      window.removeEventListener("groupSearch", loadMessages);
    };
  }, []);

  if (!Array.isArray(messages)) {
    return;
  }

  return (
    <div>
      <article id="group" class="justify-content-center d-flex">
        <div class="search-results-container container-fluid d-flex justify-content-center flex-wrap">
          {messages.length == 0 && !loaded && (
            <p>
              <div class="mt-5 spinner orange-spinner">
                <div /><div /><div /><div /><div />
              </div>
            </p>
          )}
          {messages.length == 0 && loaded && (
            <p>{t("search_without_result")}</p>
          )}
          {messages.map((msg, i) => {
            return (
              <MessageSearchResult
                tabindex={i + 1}
                key={msg.id}
                message={msg}
                groupId={groupId}
                search={search}
                hashtags={hashtags}
              />
            );
          })}
        </div>
      </article>
    </div>
  );
}
