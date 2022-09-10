import { h } from "preact";
import { useRef, useEffect } from 'preact/hooks';
import { util } from "/src/core";
import { FaIcon } from "/src/misc";

export default function MiniFile(props) {

  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;
  const innerRef = useRef(null);

  const fileDragStart = e => {
    e.target.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('id', props.file.id);
  };

  const fileDragEnd = e => {
    e.target.style.opacity = '1';
    document.querySelectorAll('.drag-over').forEach(e => e.classList.remove('drag-over'))
  };

  const fileDragEnter = e => {
    innerRef.current.classList.add('drag-over');
  }

  const fileDragLeave = e => {
    innerRef.current.classList.remove('drag-over');
  }

  const fileDragOver = e => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  const fileDrop = e => {
    // stops the browser from redirecting.
    e.preventDefault();
    e.stopPropagation();
    props.invertFiles(e.dataTransfer.getData('id'), props.file.id);
    return false;
  }

  useEffect(() => {
    if (props.inWriter) {
      innerRef.current.addEventListener("dragstart", fileDragStart);
      innerRef.current.addEventListener("dragend", fileDragEnd);
      innerRef.current.addEventListener("dragover", fileDragOver);
      innerRef.current.addEventListener("dragenter", fileDragEnter);
      innerRef.current.addEventListener("dragleave", fileDragLeave);
      innerRef.current.addEventListener("drop", fileDrop);
      return () => {
        innerRef.current.removeEventListener("dragstart", fileDragStart);
        innerRef.current.removeEventListener("dragend", fileDragEnd);
        innerRef.current.removeEventListener("dragover", fileDragOver);
        innerRef.current.removeEventListener("dragenter", fileDragEnter);
        innerRef.current.removeEventListener("dragleave", fileDragLeave);
        innerRef.current.removeEventListener("drop", fileDrop);
      };
    }
  }, []);

  switch (props.file.status) {
  case "raw":
    return (
      <a class="file-embed rounded" id={props.file.id}>
        <div class="miniature">
          <FaIcon family={"regular"} icon={"check-circle"} />
        </div>
      </a>
    );
  case "uploading":
    return (
      <a class="file-embed rounded" id={props.file.id}>
        <div
          class="miniature video-raw"
          style={`background-image:url('${util.crop(props.file.id, 160, 160)}')`}
        />
        <div class="spinner orange-spinner">
          <div /><div /><div /><div /><div />
        </div>
        { props.file && props.file.progress > 0 && (
          <div class="progress-bar">
            <div style={{ width: `${props.file.progress}%` }} />
          </div>
        )}
      </a>
    );
  case "ready":
  default:
    if (/pdf/.test(props.file.type) || /video/.test(props.file.type)) {
      return (
        <a
          ref={innerRef}
          data-origin={util.toApp(filePath)}
          href={!props.inWriter ? util.toApp(url) : undefined}
          className={`glightbox file-embed rounded image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
          data-width="calc(90vw - 10px)"
          data-height="100vh"
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url('${util.crop(props.file.id, 160, 160)}')`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            fileIndex={props.file.fileIndex}
            onClick={e => props.toggleFile(e)}
          >
            <FaIcon family={"solid"} icon={"times"} />
          </div>
        </a>
      );
    }
    if (props.file.type == "image/gif") {
      return (
        <a
          ref={innerRef}
          data-origin={util.toApp(filePath)}
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          class="glightbox file-embed rounded"
          id={props.file.id}
          data-type="image"
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url('${util.crop(props.file.id, 160, 160)}')`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            fileIndex={props.file.fileIndex}
            onClick={e => props.toggleFile(e)}
          >
            <FaIcon family={"solid"} icon={"times"} />
          </div>
        </a>
      );
    }
    if (/image/.test(props.file.type)) {
      return (
        <a
          ref={innerRef}
          data-origin={util.toApp(filePath)}
          data-type="image"
          data-srcset={`${util.thumbnail(props.file.id, 720)} 720w, ${util.thumbnail(props.file.id, 1366)} 1366w, ${util.thumbnail(props.file.id, 2048)} 2048w`}
          data-sizes="(max-width: 992px) 720px, (max-width: 1400px) 1366px, 2048px"
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          class="glightbox file-embed rounded"
          id={props.file.id}
          index={props.file.fileIndex}
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url('${util.crop(props.file.id, 160, 160)}')`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            fileIndex={props.file.fileIndex}
            onClick={e => props.toggleFile(e)}
          >
            <FaIcon family={"solid"} icon={"times"} />
          </div>
        </a>
      );
    }
  }
}
