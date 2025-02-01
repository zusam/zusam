import { Fragment, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { http } from "/src/core";
import MessageEmojiSelector from "./message-emojiselector.component";

export default function MessageReactions(props) {
  const [reactions, setReactions] = useState([]);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const MAX_VISIBLE_USERS = 5;

  const loadReactions = async (reactionData) => {
    const formattedReactions = Object.values(reactionData).map(reaction => ({
      emoji: reaction.emoji,
      count: reaction.count,
      users: reaction.users,
      currentUserReacted: reaction.currentUserReacted,
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

  const handleReactionClick = async (emoji, currentUserReacted) => {
    // If current user set this emoji type, click to remove it
    if (currentUserReacted) {
      const reactionData = await http.delete(`/api/messages/${props.messageId}/reactions/${emoji}`);
      await loadReactions(reactionData);
    }
  };

  return (
    <div className="message-reactions" >
      {reactions.map(({ emoji, count, users, currentUserReacted }) => (
        <div
          key={emoji}
          className="reaction-emoji"
          style={{
            cursor: currentUserReacted ? "pointer" : "default",
          }}
          onMouseEnter={() => setHoveredReaction(emoji)}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span
            style={{
              opacity: hoveredReaction === emoji && currentUserReacted ? 0.6 : 1,
              transition: "opacity 0.2s ease-in-out",
            }}
            onClick={() => currentUserReacted && handleReactionClick(emoji, currentUserReacted)}
          >
            {emoji}
          </span>
          <span className="reaction-count" >{count}</span>

          {hoveredReaction === emoji && (
            <div className="reaction-tooltip" >
              {users.slice(0, MAX_VISIBLE_USERS).map(user => (
                <div>{user}</div>
              ))}

              {users.length > MAX_VISIBLE_USERS && (
                <div>
                  +{users.length - MAX_VISIBLE_USERS} more
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <Fragment>
        <div class="font-size-90" className="reaction-button">
          <MessageEmojiSelector messageId={props?.messageId} updateReactions={loadReactions} />
        </div>
      </Fragment>
    </div>
  );
}
