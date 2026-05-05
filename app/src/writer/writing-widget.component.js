import { h } from "preact";
import { http, util, api } from "/src/core";
import { FaIcon } from "/src/misc";
import { EmbedBlock, FileGrid } from "/src/embed";
import QuillEditor from "../quill/quill-editor.component";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "preact/hooks";

export default function WritingWidget(props) {
  const [preview, setPreview] = useState(null);
  const [link, setLink] = useState("");
  const [text, setText] = useState(props.text || "");
  const [title, setTitle] = useState(props.title || "");
  const { t } = useTranslation();
  const writerForm = useRef(null);
  // Holds the AbortController for the current in-flight link preview request,
  // so we can cancel it when a different URL is detected.
  const previewAbortRef = useRef(null);
  // Incremented on send/clear so in-flight responses don't update state on
  // the freshly-cleared form, while still letting the server finish caching
  // the link metadata for the message that was just sent.
  const previewGenRef = useRef(0);

  const cleanForm = () => {
    previewGenRef.current++;
    setPreview(null);
    setLink(null);
    setText("");
    setTitle("");
  };

  const sendMessage = writerForm => {
    props.sendMessage(writerForm, {
      title: writerForm?.current?.querySelector(".title-input")?.value,
      text: JSON.stringify({ 
        delta: props.editorRef.current.getContents(),
        textOnly: props.editorRef.current.getText()
      })
    });
    cleanForm();
  };

  const genPreview = (text, delta) => {
    if (!text || text.trim() === "") {
      setPreview(null);
      setLink(null);
      return;
    }
    // Text can contain links, so we need the delta content to find all links
    let deltaString = JSON.stringify(delta);
    // waiting for the dom to be updated
    setTimeout(() => {
      let links = deltaString.match(/(https?:\/\/[^\s\\"]+)/gi);
      if (links && links[0] != link) {
        // Cancel any previous request before starting a new one (e.g. user
        // pasted a second URL before the first preview finished loading).
        previewAbortRef.current?.abort();
        const controller = new AbortController();
        previewAbortRef.current = controller;
        const gen = previewGenRef.current;
        http
          .get(`/api/links/by_url?url=${encodeURIComponent(links[0])}`, false, 0, controller.signal)
          .then(r => {
            // Drop the result if the form was sent/cleared after this request
            // started — the generation will have been incremented by cleanForm().
            if (r && deltaString.indexOf(links[0]) >= 0 && previewGenRef.current === gen) {
              setLink(links[0]);
              setPreview(r);
            }
          })
          // Silently swallow AbortError — an abort is intentional, not an error.
          .catch(() => {});
      }
    }, 0);
  };

  const onKeyDown = (event) => {
    if (event.ctrlKey && util.is_it_enter(event)) {
      sendMessage(writerForm);
      return;
    }
  };

  const onPaste = (event) => {
    props.addFiles("image/jpeg", event.clipboardData.files);
  };

  if (props.sending) {
    return (
      <div class="message-placeholder">
        <div class="spinner orange-spinner">
          <div /><div /><div /><div /><div />
        </div>
      </div>
    );
  }
  return (
    <div id={props.id} class="writer" ref={writerForm}>
      {!props.isChild && (
        <input
          type="text"
          class="title-input"
          onKeyPress={e => onKeyDown(e)}
          placeholder={t("title_placeholder")}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      )}

      <div 
        onPasteCapture={onPaste}
        onKeyDown={onKeyDown}
      >
        <QuillEditor
          editorRef={quill => { props.editorRef.current = quill; }}
          defaultValue={text}
          placeholder={t("text_placeholder")}
          genPreview={genPreview}
        />
      </div>

      {!!preview && (
        <EmbedBlock inWriter={true} {...preview} />
      )}
      {!!props.files.length && (
        <FileGrid
          files={props.files}
          toggleFile={props.toggleFile}
          invertFiles={props.invertFiles}
          inWriter={true}
        />
      )}
      <div class="options">
        {api?.info?.upload?.image && (
          <button
            class="option"
            onClick={() => props.inputFile("image/*", true)}
            title={t("upload_image")}
          >
            <FaIcon family={"regular"} icon={"images"} />
          </button>
        )}
        {api?.info?.upload?.video && (
          <button
            class="option"
            onClick={() => props.inputFile("video/*")}
            title={t("upload_video")}
          >
            <FaIcon family={"solid"} icon={"film"} />
          </button>
        )}
        {api?.info?.upload?.pdf && (
          <button
            class="option"
            onClick={() => props.inputFile("application/pdf")}
            title={t("upload_pdf")}
          >
            <FaIcon family={"regular"} icon={"file-pdf"} />
          </button>
        )}
        <div class="actions">
          {!!props.cancel && (
            <button class="cancel" onClick={e => props.cancel(e)}>
              {t("cancel")}
            </button>
          )}
          <button
            disabled={!props.group || props.uploading}
            type="submit"
            class="submit"
            onClick={() => sendMessage(writerForm)}
          >
            {t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
