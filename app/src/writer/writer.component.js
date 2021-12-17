import { h } from "preact";
import { alert, http, util, me } from "/src/core";
import { useTranslation } from 'react-i18next';
import { WritingWidget } from '/src/writer';
import { useNavigate } from "react-router-dom";
import { useState } from "preact/hooks";

export default function Writer(props) {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const writerId = util.genId();

  //this.state = {
  //  files: [],
  //  writerId: util.genId(),
  //  workers: [],
  //  workerManager: setInterval(this.manageWorkers, 1000),
  //};

  //componentDidMount() {
  //  if (document.getElementById("title")) {
  //    document.getElementById("title").value = this.props.title || "";
  //  }
  //  if (document.getElementById("text")) {
  //    document.getElementById("text").value = this.props.text || "";
  //  }
  //}

  const getSendableMessage = (textInput, titleInput) => {
    return {
      files: files.filter(e => !e.removed).filter(e => e.status == "ready").map(e => e["id"]).filter(e => !!e),
      data: {
        text: textInput.value || "",
        title: titleInput.value || "",
      }
    };
  };

  const putMessage = msg => {
    http.put(`/api/messages/${props.messageId}`, msg).then(res => {
      setSending(false);
      if (!res) {
        alert.add(t("error_new_message"), "alert-danger");
        return;
      }
      window.dispatchEvent(new CustomEvent("editMessage", { detail: res }));
    });
    setSending(true);
  }

  const postMessage = msg => {
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
      this.setState({
        files: [],
        link: null,
        preview: null,
        writerId: util.genId(),
      });
      if (document.getElementById("text")) {
        document.getElementById("text").value = "";
      }
    });
    setSending(true);
  }

  const sendMessage = writerForm => {
    let msg = getSendableMessage(
      writerForm.current.getElementsByClassName('title-input')[0],
      writerForm.current.getElementsByClassName('text-input')[0]
    );
    if (props.messageId) {
      putMessage(msg);
    } else {
      postMessage(msg);
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
      let list = Array.from(event.target.files);
      list.map(e => {
        setFiles([{
          inputFile: e,
          type: mimetype,
          id: util.genId(),
          progress: 0,
          status: 'initial'
        }, ...files]);
      });
    });
    input.click();
  };

  //const updateFile = (id, file, callback = null) => {
  //  setFiles(files.map(f => f.id === id ? Object.assign(f, file) : f));
  //  callback();
  //};

  //const removeFile = id => {
  //  setFiles(files.filter(f => f.id != id));
  //};

  //manageWorkers() {
  //  if (this.state.workers.length >= navigator.hardwareConcurrency) {
  //    return;
  //  }
  //  let target = files.find(
  //    e => !this.state.workers.map(w => w.target && w.target.id).includes(e.id) && e.status == 'initial'
  //  );
  //  if (target) {
  //    let worker = {
  //      target,
  //      id: util.genId(),
  //    };
  //    this.setState(prevState => ({
  //      workers: [...prevState.workers, worker]
  //    }), () => this.addWorker(worker.id));
  //  }
  //}

  //removeWorker(workerId) {
  //  this.setState(prevState => ({
  //    workers: prevState.workers.filter(e => e.id != workerId)
  //  }));
  //}

  //addWorker(workerId) {
  //  let worker = this.state.workers.find(e => e.id == workerId);
  //  switch (worker.target.type) {
  //    case "image":
  //      import("/src/lazy/image-service.js").then(imageService => {
  //        imageService.default.handleImage(
  //          worker.target.inputFile,
  //          res => {
  //            this.updateFile(
  //              worker.target.id,
  //              {inputFile: res},
  //              this.uploadFile(worker.target.id, () => this.removeWorker(workerId))
  //            );
  //          }
  //        );
  //      });
  //      break;
  //    case "video":
  //      this.uploadFile(worker.target.id, () => this.removeWorker(workerId));
  //      break;
  //    case "application/pdf":
  //      this.uploadFile(worker.target.id, () => this.removeWorker(workerId));
  //      break;
  //    default:
  //      // don't know what to do
  //      // TODO handle this properly
  //      console.warn(worker.target);
  //      console.warn("unknown file type for worker");
  //  }
  //}

  //const uploadFile = (fileId, callback = null) => {
  //  const formData = new FormData();
  //  let file = files.find(e => e.id == fileId);
  //  if (!file || !file.inputFile) {
  //    // TODO handle this properly
  //    console.error(files, file, fileId);
  //    throw "error";
  //  }
  //  formData.append("file", file.inputFile);
  //  formData.append("fileIndex", files.findIndex(f => f.id == file.id));

  //  // store current writerId for later comparison
  //  let writerId = writerId;

  //  http.sendFile(
  //    formData,
  //    file => {
  //      // update state only if it's the good writeId
  //      if (writerId == writerId) {
  //        file['status'] = 'ready';
  //        this.updateFile(fileId, file, callback);
  //      }
  //    },
  //    e => {
  //      updateFile(
  //        fileId,
  //        {progress: Math.floor((e.loaded / e.total) * 100)}
  //      )
  //    },
  //    e => {
  //      console.warn(e);
  //      alert.add(t("error_upload"), "alert-danger");
  //      removeFile(fileId);
  //    }
  //  );
  //};

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
    />
  );
}
