import { h } from "preact";
import { http, util, api } from "/src/core";
import { FaIcon } from "/src/misc";
import { EmbedBlock, FileGrid } from "/src/embed";
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'preact/hooks';

export default function WritingWidget(props) {
  const [preview, setPreview] = useState(null);
  const [link, setLink] = useState("");
  const { t, i18n } = useTranslation();
  const writerForm = useRef(null);

  const cleanForm = () => {
    setPreview(null);
    setLink(null);
  }

  const sendMessage = writerForm => {
    props.sendMessage(writerForm);
    cleanForm();
  }

  const genPreview = (t) => {
    t.style.height = "1px";
    t.style.height = `${25 + t.scrollHeight}px`;
    // waiting for the dom to be updated
    setTimeout(() => {
      const text = t.value;
      let links = text.match(/(https?:\/\/[^\s]+)/gi);
      if (links && links[0] != link) {
        http
          .get(`/api/links/by_url?url=${  encodeURIComponent(links[0])}`)
          .then(r => {
            if (r && t.value.indexOf(links[0]) >= 0) {
              setLink(links[0]);
              setPreview(r);
            }
          });
      }
    }, 0);
  };

  const onKeyPress = (event, doGenPreview = false) => {
    if (event.ctrlKey && util.is_it_enter(event)) {
      sendMessage(writerForm);
      return;
    }
    if (![" ", "Enter", "v"].includes(event.key)) {
      return;
    }
    if (doGenPreview) {
      genPreview(event.currentTarget);
    }
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
          onKeyPress={e => onKeyPress(e)}
          placeholder={t("title_placeholder")}
          value={props.title}
         />
      )}
      <textarea
        onKeyPress={e => onKeyPress(e, true)}
        class="text-input"
        rows="5"
        autocomplete="off"
        autofocus={props.focus}
        placeholder={t("text_placeholder")}
        maxlength="50000"
        value={props.text}
       />
      {!!preview && (
        <EmbedBlock inWriter={true} {...preview} />
      )}
      {!!props.files.length && (
        <FileGrid
          key={props.files.reduce(
            (a, c) => a + c.id + c.fileIndex + c.error,
            ""
          )}
          files={props.files}
          toggleFile={props.toggleFile}
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
            disabled={!props.group}
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
