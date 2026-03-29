import { Fragment, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { http } from "/src/core";
import MessageEmojiSelector from "./message-emojiselector.component";
import {useTranslation} from "react-i18next";

export default function MessageReactions(props) {
  const [reactions, setReactions] = useState([]);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [emojiData, setEmojiData] = useState({});
  const [emojiMap, setEmojiMap] = useState({});
  const { t, i18n } = useTranslation();

  const MAX_VISIBLE_USERS = 10;

  const loadReactions = async (reactionData) => {
    const formattedReactions = Object.values(reactionData).map(reaction => ({
      emoji: reaction.emoji,
      unified: reaction.unified,
      count: reaction.count,
      users: reaction.users,
      currentUserReactionId: reaction.currentUserReactionId,
    }));
    setReactions(formattedReactions);
  };

  const capitaliseFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

  const langMap = {
    de_DE: () => import("./emoji-lang/emojis-de.js"),
    es_ES: () => import("./emoji-lang/emojis-es.js"),
    en_US: () => import("./emoji-lang/emojis-en.js"),
    fi_FI: () => import("./emoji-lang/emojis-fi.js"),
    fr_FR: () => import("./emoji-lang/emojis-fr.js"),
    hu_HU: () => import("./emoji-lang/emojis-hu.js"),
    it_IT: () => import("./emoji-lang/emojis-it.js"),
    ko_KR: () => import("./emoji-lang/emojis-ko.js"),
    nb_NO: () => import("./emoji-lang/emojis-nb.js"),
    nl_NL: () => import("./emoji-lang/emojis-nl.js"),
    pl_PL: () => import("./emoji-lang/emojis-pl.js"),
    pt_BR: () => import("./emoji-lang/emojis-pt.js"),
    ru_RU: () => import("./emoji-lang/emojis-ru.js"),
    zh_Hans: () => import("./emoji-lang/emojis-zh.js")
  };

  useEffect(() => {
    if (!props.messageId) return;

    const fetchReactions = async () => {
      const reactionData = await http.get(`/api/messages/${props.messageId}/reactions`).catch(() => null);
      if (reactionData) await loadReactions(reactionData);
    };

    fetchReactions();
  }, [props.messageId]);

  useEffect(() => {
    if (!langMap[i18n.language]) {
      setEmojiData({});
      setEmojiMap({});
      return;
    }

    const load = async () => {
      const module = await langMap[i18n.language]();
      const data = module.default;
      setEmojiData(data);

      const map = {};
      Object.values(data.emojis).forEach(category => {
        category.forEach(e => {
          map[e.u] = e.n?.[e.n.length - 1] || ""; // The last item in this list of names appears to be the most descriptive
        });
      });

      setEmojiMap(map);
    };

    load();
  }, [i18n.language]);

  const handleReactionClick = async (currentUserReactionId) => {
    // If current user set this emoji type, click to remove it
    if (currentUserReactionId) {
      await http.delete(`/api/messages/${props.messageId}/reactions/${currentUserReactionId}`).catch(err => console.warn(err));
      const reactionData = await http.get(`/api/messages/${props.messageId}/reactions`).catch(() => null);
      if (reactionData) await loadReactions(reactionData);
    }
  };

  return (
    <a className="d-flex action seamless-link font-size-90 capitalize" >
      {reactions.map(({ emoji, unified, count, users, currentUserReactionId }) => {
        const name = capitaliseFirstLetter(emojiMap[unified]) || "";

        return (
          <div
            key={emoji}
            className="reaction-emoji"
            style={{
              cursor: currentUserReactionId ? "pointer" : "default",
            }}
            title={
              `${emoji} ${name}\n\n` +
              users.slice(0, MAX_VISIBLE_USERS).join("\n") +
              (users.length > MAX_VISIBLE_USERS
                ? `\n${t("and_x_more", { count: `${users.length - MAX_VISIBLE_USERS}` })}...`
                : "")
            }
            onMouseEnter={() => setHoveredReaction(emoji)}
            onMouseLeave={() => setHoveredReaction(null)}
          >
            <span
              style={{
                opacity: hoveredReaction === emoji && currentUserReactionId ? 0.6 : 1,
                transition: "opacity 0.2s ease-in-out",
              }}
              onClick={() => currentUserReactionId && handleReactionClick(currentUserReactionId)}
            >
              {emoji}
            </span>
            <span className="reaction-count">{count}</span>
          </div>
        );
      })}
      {reactions.length > 0 && (
        <div class="dot">&bull;</div>
      )}

      <Fragment>
        <div class="font-size-90" className="reaction-button">
          <MessageEmojiSelector messageId={props?.messageId} updateReactions={loadReactions} languageData={emojiData}/>
        </div>
      </Fragment>
    </a>
  );
}
