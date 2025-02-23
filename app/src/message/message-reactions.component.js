import { Fragment, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { http } from "/src/core";
import MessageEmojiSelector from "./message-emojiselector.component";
import {useTranslation} from "react-i18next";

export default function MessageReactions(props) {
  const [reactions, setReactions] = useState([]);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const { t } = useTranslation();

  const MAX_VISIBLE_USERS = 10;

  const loadReactions = async (reactionData) => {
    const formattedReactions = Object.values(reactionData).map(reaction => ({
      emoji: reaction.emoji,
      count: reaction.count,
      users: reaction.users,
      currentUserReactionId: reaction.currentUserReactionId,
    }));
    setReactions(formattedReactions);
  };

  useEffect(() => {
    if (!props.messageId) return;

    const fetchReactions = async () => {
      const reactionData = await http.get(`/api/messages/${props.messageId}/reactions`);
      await loadReactions(reactionData);
    };

    fetchReactions();
  }, [props.messageId]);

  const handleReactionClick = async (currentUserReactionId) => {
    // If current user set this emoji type, click to remove it
    if (currentUserReactionId) {
      await http.delete(`/api/messages/${props.messageId}/reactions/${currentUserReactionId}`);
      await loadReactions(await http.get(`/api/messages/${props.messageId}/reactions`));
    }
  };

  return (
    <a className="d-flex action seamless-link font-size-90 capitalize" >
      {reactions.map(({ emoji, count, users, currentUserReactionId: currentUserReactionId }) => (
        <div
          key={emoji}
          className="reaction-emoji"
          style={{
            cursor: currentUserReactionId ? "pointer" : "default",
          }}
          title={users.slice(0, MAX_VISIBLE_USERS).join("\n") + (users.length > MAX_VISIBLE_USERS ? `\n${t("and_x_more", { count: `${users.length - MAX_VISIBLE_USERS}` })}...` : "")}
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
          <span className="reaction-count" >{count}</span>
        </div>
      ))}
      {reactions.length > 0 && (
        <div class="dot">&bull;</div>
      )}

      <Fragment>
        <div class="font-size-90" className="reaction-button">
          <MessageEmojiSelector messageId={props?.messageId} updateReactions={loadReactions} />
        </div>
      </Fragment>
    </a>
  );
}
