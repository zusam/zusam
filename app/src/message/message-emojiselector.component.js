import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { http } from "/src/core";
import {useTranslation} from "react-i18next";
import { lazy, Suspense } from "preact/compat";
const EmojiPicker = lazy(() => import("emoji-picker-react"));

export default function MessageEmojiSelector(props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const { t } = useTranslation();

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
    import("emoji-picker-react");
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div ref={pickerRef} >
      <div style={{cursor: "pointer"}} onClick={() => {if (EmojiPicker) setShowPicker(!showPicker);}}>➕ {t("react")}</div>
      {showPicker && (
        <div style={{position: "absolute", zIndex: 1000}}>
          <Suspense fallback={null}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              emojiStyle="native"
              reactionsDefaultOpen={true}
              previewConfig={{defaultEmoji: "26aa", defaultCaption: "", showPreview: true}}
              reactions={["1f44d", "2764-fe0f", "1f923", "1f622", "1f44e", "1f621"]}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
