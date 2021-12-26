import { h } from "preact";
import { alert, http, util, me } from "/src/core";
import { useTranslation } from 'react-i18next';
import { WritingWidget } from '/src/writer';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "preact/hooks";

export default function Writer(props) {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [files, setFiles] = useState(props?.files || []);
  const [sending, setSending] = useState(false);
  const [workers, setWorkers] = useState(0);
  const writerId = util.genId();

  const setForm = (writerForm, files = [], title = "", text = "") => {
    setFiles(files);
    Array.from(writerForm.current.getElementsByClassName('title-input')).map(e => e.value = title);
    Array.from(writerForm.current.getElementsByClassName('text-input')).map(e => e.value = text);
  }

  const updateFile = (id, file) => {
    setFiles(files.map(f => f.id === id ? Object.assign(f, file) : f));
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

    formData.append("fileIndex", file.fileIndex);
    formData.append("file", file.inputFile);

    file['status'] = 'uploading';
    setWorkers(workers+1);
    updateFile(fileId, file);

    http.sendFile(
      formData,
      file => {
        setWorkers(workers-1);
        file['status'] = 'ready';
        updateFile(fileId, file);
      },
      e => {
        updateFile(
          fileId,
          {progress: Math.floor((e.loaded / e.total) * 100)}
        )
      },
      e => {
        console.warn(e);
        alert.add(t("error_upload"), "alert-danger");
        setWorkers(workers-1);
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
  }

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
  }

  const sendMessage = (writerForm, data) => {
    let msg = {
      files: files.filter(e => !e?.removed).filter(e => e?.status == "ready").map(e => e?.id).filter(e => !!e),
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
  const toggleFile = (fileIndex) => {
    let f = files.find(f => f.fileIndex == fileIndex);
    f.removed = !f.removed;
    setFiles(files);
  }

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
      let fileIndex = files.reduce((a, f) => Math.max(a, f?.fileIndex || 0), 0) + 1;
      let list = Array.from(event.target.files).map(e => ({
        inputFile: e,
        type: mimetype,
        id: util.genId(),
        progress: 0,
        status: 'initial',
        fileIndex: ++fileIndex,
      }));
      setFiles([...list, ...files]);
    });
    input.click();
  };

  useEffect(() => {
    files.forEach(e => {
      if (e.status == "initial" && !!e.inputFile && workers < 3) {
        setTimeout(() => uploadFile(e.id), 100);
      }
    });
  });

  return (
    <WritingWidget
      id={writerId}
      sending={sending}
      inputFile={inputFile}
      sendMessage={sendMessage}
      cancel={props.cancel}
      files={files}
      toggleFile={toggleFile}
      group={props.group}
      isChild={props.isChild}
      text={props.text}
      title={props.title}
    />
  );
}
