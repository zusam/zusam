import { h } from "preact";
import { alert, http, util, me } from "/src/core";
import { useTranslation } from "react-i18next";
import { WritingWidget } from "/src/writer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "preact/hooks";

// trick from https://stackoverflow.com/a/53837442
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
}

export default function Writer(props) {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [files, setFiles] = useState(props?.files || []);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const forceUpdate = useForceUpdate();
  const writerId = util.genId();

  // This allows to have the latest state of files in callbacks
  // https://stackoverflow.com/a/60643670
  const currentFiles = useRef();
  currentFiles.current = files;

  const setForm = (writerForm, files = [], title = "", text = "") => {
    setFiles(files);
    Array.from(writerForm.current.getElementsByClassName("title-input")).map(e => e.value = title);
    Array.from(writerForm.current.getElementsByClassName("text-input")).map(e => e.value = text);
  };

  const updateFile = (id, file) => {
    setFiles(currentFiles.current.map(f => f.id === id ? Object.assign(f, file) : f));
  };

  const invertFiles = (id_a, id_b) => {
    const index_a = files.findIndex(e => e.id === id_a);
    const index_b = files.findIndex(e => e.id === id_b);
    [files[index_a], files[index_b]] = [files[index_b], files[index_a]];
    setFiles(files);
    forceUpdate();
  };

  const removeFile = id => {
    setFiles(files.filter(f => f.id != id));
  };

  const uploadFile = fileId => {
    const formData = new FormData();
    let file = files.find(e => e.id == fileId);
    if (!file || !file.inputFile) {
      // TODO handle this properly
      console.error(files, file, fileId);
      throw "error";
    }

    formData.append("file", file.inputFile);

    updateFile(fileId, Object.assign(file, {status: "uploading"}));
    setUploading(true);

    http.sendFile(
      formData,
      file => {
        setUploading(false);
        updateFile(fileId, Object.assign({status: "ready"}, file));
      },
      e => {
        updateFile(
          fileId,
          {status: "uploading", progress: Math.floor((e.loaded / e.total) * 100)}
        );
      },
      e => {
        setUploading(false);
        console.warn(e);
        alert.add(t("error_upload"), "alert-danger");
        removeFile(fileId);
      }
    );
  };

  const putMessage = (msg, writerForm) => {
    http.put(`/api/messages/${props.messageId}`, msg).then(res => {
      setForm(writerForm, [], "", "");
      setSending(false);
      if (!res) {
        alert.add(t("error_new_message"), "alert-danger");
        return;
      }
      window.dispatchEvent(new CustomEvent("editMessage", { detail: res }));
    });
    setSending(true);
  };

  const postMessage = (msg, writerForm) => {
    msg = Object.assign(msg, {
      createdAt: Math.floor(Date.now() / 1000),
      author: me.id,
      group: util.getId(props.group),
      children: [],
      lastActivityDate: Math.floor(Date.now() / 1000)
    });
    if (props.parent) {
      msg.parent = util.getId(props.parent);
    }
    // don't post if there is nothing to post
    if (!msg.files.length && !msg.data.text && !msg.data.title) {
      alert.add(t("empty_message"), "alert-danger");
      return;
    }
    http.post("/api/messages", msg).then(res => {
      if (!res) {
        setSending(false);
        alert.add(t("error_new_message"), "alert-danger");
        return;
      }
      if (props.isChild) {
        setSending(false);
        window.dispatchEvent(new CustomEvent("newChild", { detail: res }));
      } else {
        navigate(`/messages/${res.id}`);
      }
      setForm(writerForm, [], "", "");
    });
    setSending(true);
  };

  const sendMessage = (writerForm, data) => {
    let msg = {
      files: files.filter(e => !e?.removed).filter(e => ["ready", "raw"].includes(e?.status)).map(e => e?.id).filter(e => !!e),
      data: {
        title: data?.title,
        text: data?.text,
      }
    };
    if (props.messageId) {
      putMessage(msg, writerForm);
    } else {
      postMessage(msg, writerForm);
    }
  };

  // toggle state (removed or not) of a file
  const toggleFile = id => {
    setFiles(files.map(f => {
      if (f.id == id) {
        f.removed = !f.removed;
      }
      return f;
    }));
  };

  const addFiles = (mimetype, input_files) => {
    let list = Array.from(input_files).map(e => ({
      inputFile: e,
      type: mimetype,
      id: util.genId(),
      progress: 0,
      status: "initial",
    }));
    setFiles([...files, ...list]);
  };

  const inputFile = (mimetype, multiple = false) => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.style.display = "none";
    input.type = "file";
    input.accept = mimetype;
    if (multiple) {
      input.multiple = "multiple";
    }
    input.addEventListener("change", event => {
      addFiles(mimetype, event.target.files);
    });
    input.click();
  };

  useEffect(() => {
    if (files.filter(e => e.status === "uploading").length < 2) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].status == "initial" && !!files[i].inputFile) {
          uploadFile(files[i].id);
          break;
        }
      }
    }
  }, [files]);

  return (
    <WritingWidget
      id={writerId}
      sending={sending}
      uploading={uploading}
      inputFile={inputFile}
      sendMessage={sendMessage}
      cancel={props.cancel}
      files={files}
      toggleFile={toggleFile}
      invertFiles={invertFiles}
      addFiles={addFiles}
      group={props.group}
      isChild={props.isChild}
      text={props.text}
      title={props.title}
    />
  );
}
