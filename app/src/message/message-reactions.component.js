import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { http } from "/src/core";
import MessageEmojiSelector from "./message-emojiselector.component";
import { useTranslation } from "react-i18next";

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

  const langMap = {
    de_DE: () => import("emoji-picker-react/dist/data/emojis-de"),
    es_ES: () => import("emoji-picker-react/dist/data/emojis-es"),
    en_US: () => import("emoji-picker-react/dist/data/emojis-en"),
    fi_FI: () => import("emoji-picker-react/dist/data/emojis-fi"),
    fr_FR: () => import("emoji-picker-react/dist/data/emojis-fr"),
    hu_HU: () => import("emoji-picker-react/dist/data/emojis-hu"),
    it_IT: () => import("emoji-picker-react/dist/data/emojis-it"),
    ko_KR: () => import("emoji-picker-react/dist/data/emojis-ko"),
    nb_NO: () => import("emoji-picker-react/dist/data/emojis-nb"),
    nl_NL: () => import("emoji-picker-react/dist/data/emojis-nl"),
    pl_PL: () => import("emoji-picker-react/dist/data/emojis-pl"),
    pt_BR: () => import("emoji-picker-react/dist/data/emojis-pt"),
    ru_RU: () => import("emoji-picker-react/dist/data/emojis-ru"),
    zh_Hans: () => import("emoji-picker-react/dist/data/emojis-zh"),
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

  const handleReactionClick = async (currentUserReactionId, emoji) => {
    // If current user set this emoji type, click to remove it
    if (currentUserReactionId) {
      await http.delete(`/api/messages/${props.messageId}/reactions/${currentUserReactionId}`).catch(err => console.warn(err));
    } else {
      // If current user hasn't selected this emoji, click to add a reaction with this emoji type
      await http.post(`/api/messages/${props.messageId}/reactions`, {
        reaction: emoji,
      }).catch(err => console.warn(err));
    }

    const reactionData = await http.get(`/api/messages/${props.messageId}/reactions`).catch(err => console.warn(err));
    if (reactionData) await loadReactions(reactionData);
  };

  return (
    <a className="d-flex action seamless-link font-size-90 capitalize" >
      {reactions.map(({ emoji, unified, count, users, currentUserReactionId }) => {
        const name = emojiMap[unified];

        const tooltipUserList =
          users.slice(0, MAX_VISIBLE_USERS).join(", ") +
          (users.length > MAX_VISIBLE_USERS
            ? `\n${t("and_x_more", { count: `${users.length - MAX_VISIBLE_USERS}` })}...`
            : "");

        return (
          <div
            key={emoji}
            className="reaction-emoji"
            onMouseEnter={() => setHoveredReaction(emoji)}
            onMouseLeave={() => setHoveredReaction(null)}
          >
            <span
              style={{
                opacity: hoveredReaction === emoji && currentUserReactionId ? 0.6 : 1,
                transition: "opacity 0.2s ease-in-out",
              }}
              onClick={() => handleReactionClick(currentUserReactionId ?? "", emoji)}
            >
              {emoji}
            </span>

            <span className="reaction-count">{count}</span>

            {hoveredReaction === emoji && (
              <div className="reaction-tooltip">
                <div className="reaction-title"><span className="reaction-tooltip-emoji">{emoji}</span> <span>{name}</span></div>
                <hr className="reaction-hr" />
                <div className="reaction-user-list">
                  { tooltipUserList }
                </div>
              </div>
            )}
          </div>
        );
      })}

      {reactions.length > 0 && (
        <div className="dot">&bull;</div>
      )}

      <MessageEmojiSelector
        messageId={props?.messageId}
        updateReactions={loadReactions}
        languageData={emojiData}
      />
    </a>
  );
}