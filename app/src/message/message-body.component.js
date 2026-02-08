import { h } from "preact";
import { http, util, api } from "/src/core";
import { EmbedBlock, FileGrid } from "/src/embed";
import { useEffect, useState, useRef } from "preact/hooks";
import QuillReadOnly from "./QuillReadOnly";

export default function MessageBody(props) {

  const [preview, setPreview] = useState(null);
  const readOnlyRefs = useRef({});

  const displayStandardMessageText = (text) => {
    if (!text) {
      return "";
    }
    // escape html a little (just enough to avoid xss I hope)
    let txt = text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .trim();
    // replace url by real links
    let shift = 0;
    let match = null;
    while ((match = util.getUrl(txt.slice(shift)))) {
      let url = match[0];
      if (url.length >= 50) {
        url = `${url.slice(0, 25)  }...${  url.slice(-24)}`;
      }
      let link = `<a href="${match[0]}" target="_blank">${url}</a>`;
      txt =
        txt.slice(0, match["index"] + shift) +
        link +
        txt.slice(match["index"] + shift + match[0].length);
      shift += match["index"] + link.length;
    }
    // replace line returns
    txt = txt.replace(/\n/g, "<br/>");
    return { __html: txt };
  };

  useEffect(() => {
    if (!preview && props.message) {
      if (props.message.data) {
        let previewUrl = util.getUrl(props.message.data["text"]);
        if (previewUrl) {
          http
            .get(`/api/links/by_url?url=${encodeURIComponent(previewUrl[0])}`)
            .then(r => setPreview(r));
        }
      }
    }
  }, [preview, props.message]);

  let messageContent = "";
  let quillRichText = props.message.type === "rich_text";
  // We need to handle messages created before the editor 
  // was added and we started storing in JSON
  if (props.message?.data?.text) {
    try {
      const quillContent = JSON.parse(props.message.data.text);
      messageContent = quillRichText ? quillContent.delta : quillContent.textOnly;
    } catch {
      quillRichText = false;
      messageContent = props.message.data["text"];
    }
  }
  return (
    <div class="message-body">
      {props.message.data && props.message.data.title && (
        <div class="title">
          <span>{props.message.data.title}</span>
        </div>
      )}
      {props.message.data &&
        props.message.data.text &&
        props.message.data.text.trim() && (
        <div class="card-text" >
          {quillRichText ? (
            <QuillReadOnly
              editorRef={quill => { readOnlyRefs.current[props.message.id] = quill; }}
              contents={messageContent}
            />
          ) : (
            <p
              class="card-text"
              dangerouslySetInnerHTML={displayStandardMessageText(messageContent)}
            />
          )}
        </div>
      )}
      {preview && (!props.message.data || !props.message.data["no_embed"]) && (
        <EmbedBlock
          key={preview.url}
          url={preview.url}
          preview={preview.preview}
          data={preview.data}
        />
      )}
      {props.files && (
        <FileGrid files={props.files} />
      )}
    </div>
  );
}