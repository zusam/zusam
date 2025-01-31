import {Fragment, h} from "preact";
import { useState, useEffect } from "preact/hooks";
import { http } from "/src/core";
import MessageEmojiSelector from "./message-emojiselector.component";

export default function MessageReactions(props) {
  const [reactions, setReactions] = useState([]);

  const loadReactions = (reactionData) => {

    const groupedReactions = reactionData.reduce((acc, reaction) => {
      const emoji = reaction.reaction;
      if (acc[emoji]) {
        acc[emoji].count += 1;
      } else {
        acc[emoji] = { emoji, count: 1 };
      }
      return acc;
    }, {});

    setReactions(Object.values(groupedReactions));
  };

  useEffect(() => {
    if (!props.messageId) return;

    const fetchReactions = async () => {
      const reactionData = await http.get(`/api/messages/${props.messageId}/reactions`);
      loadReactions(reactionData);
    };

    fetchReactions();
  }, [props.messageId]);

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "5px", marginLeft: "5px" }}>
      {reactions.map(({ emoji, count }) => (
        <div key={emoji} style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "4px" }}>
          <span>{emoji}</span>
          <span style={{ fontSize: "0.8rem", color: "#666" }}>{count}</span>
        </div>
      ))}
      <Fragment>
        <div class="font-size-90"  style={{ marginTop: "5px" }}>
          <MessageEmojiSelector messageId={props?.messageId} updateReactions={loadReactions} />
        </div>
      </Fragment>
    </div>
  );
}
