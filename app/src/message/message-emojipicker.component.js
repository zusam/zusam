import { h } from "preact";
import { useState } from "preact/hooks";
import EmojiPicker from "emoji-picker-react";
export default function MessageEmojiSelector(props) {
  const [showPicker, setShowPicker] = useState(false);
  const handleEmojiClick = (emoji) => {
    setShowPicker(false);
  };

  return (
    <div>
      <div  style={{cursor: "pointer"}} onClick={() => setShowPicker(!showPicker)}>😀</div>
      {showPicker && (
        <div style={{position: "absolute", zIndex: 1000}}>
          <EmojiPicker onEmojiClick={handleEmojiClick}/>
        </div>
      )}
    </div>
  );
}
