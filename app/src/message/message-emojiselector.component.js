import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import EmojiPicker from "emoji-picker-react";
import { http } from "/src/core";

export default function MessageEmojiSelector(props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const handleEmojiClick = async (emoji) => {
    setShowPicker(false);
    const response = await http.post(`/api/messages/${props.messageId}/reactions`, {
      reaction: emoji.emoji,
    });
    props.updateReactions(response);
  };

  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div ref={pickerRef} >
      <div style={{cursor: "pointer"}} onClick={() => setShowPicker(!showPicker)}>➕ React</div>
      {showPicker && (
        <div style={{position: "absolute", zIndex: 1000}}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            emojiStyle="native"
            reactionsDefaultOpen={true}
            previewConfig={{defaultEmoji: "26aa", defaultCaption: "", showPreview: true}}
          />
        </div>
      )}
    </div>
  );
}
