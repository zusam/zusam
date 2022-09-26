import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import { util } from "/src/core";
import { FaIcon } from "/src/misc";
import { polyfill } from "mobile-drag-drop";
import GLightbox from "glightbox";

export default function MiniFile(props) {

  const [lightbox, setLightbox] = useState(null);

  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;
  const innerRef = useRef(null);
  polyfill({
    tryFindDraggableTarget: e => {
      if (!props.inWriter) {
        return undefined;
      }
      const cp = e.composedPath();
      for (const o of cp) {
        let el = o;
        do {
          if (el.draggable === false) {
            continue;
          }
          if (el.draggable === true) {
            return el;
          }
          if (
            el.getAttribute
            && el.getAttribute("draggable") === "true"
          ) {
            return el;
          }
        } while((el = el.parentNode) && el !== document.body);
      }
    },
  });

  useEffect(() => {
    setLightbox(GLightbox({
      autoplayVideos: false,
      draggable: true,
      loop: false,
      touchNavigation: true,
      zoomable: true,
      elements: [],
    }));
  }, []);

  const openLightbox = evt => {
    if (!props.inWriter) {
      evt.preventDefault();
      evt.stopPropagation();
      if (lightbox != null && Array.from(document.getElementsByClassName("glightbox")).length > 0) {
        const elements = Array.from(document.getElementsByClassName("glightbox")).map(e => {
          const r = {href: e.href};
          if (e?.dataset?.width) {
            r.width = e?.dataset?.width;
          }
          if (e?.dataset?.height) {
            r.height = e?.dataset?.height;
          }
          if (e?.dataset?.type) {
            r.type = e?.dataset?.type;
          }
          if (e?.dataset?.srcset) {
            r.srcset = e?.dataset?.srcset;
          }
          if (e?.dataset?.sizes) {
            r.sizes = e?.dataset?.sizes;
          }
          return r;
        });
        lightbox.setElements(elements);
        lightbox.open(null, elements.findIndex(e => e.href === evt.target.closest(".glightbox").href));
      }
    }
  };

  const fileDragStart = e => {
    e.target.style.opacity = "0.4";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("id", props.file.id);
    document.querySelectorAll(".remove-button").forEach(e => e.style.display = "none");
  };

  const fileDragEnd = e => {
    e.target.style.opacity = "1";
    document.querySelectorAll(".remove-button").forEach(e => e.style.display = "block");
    document.querySelectorAll(".drag-over").forEach(e => e.classList.remove("drag-over"));
  };

  const fileDragEnter = e => {
    e.preventDefault();
    innerRef.current.classList.add("drag-over");
    return false;
  };

  const fileDragLeave = e => {
    e.preventDefault();
    innerRef.current.classList.remove("drag-over");
    return false;
  };

  // necessary to declare a drop target
  const fileDragOver = e => {
    e.preventDefault();
    return false;
  };

  const fileDrop = e => {
    // stops the browser from redirecting.
    e.preventDefault();
    props.invertFiles(e.dataTransfer.getData("id"), props.file.id);
    return false;
  };

  useEffect(() => {
    if (props.inWriter && props.file.status == "ready") {
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
  case "loading":
    return (
      <a class="file-embed rounded" id={props.file.id}>
        <div class="miniature"/>
      </a>
    );
  case "uploading":
  case "initial":
    return (
      <a class="file-embed rounded" id={props.file.id}>
        <div
          class="miniature video-raw"
          style={`background-image:url("${util.crop(props.file.id, 160, 160)}")`}
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
          draggable={!!props.inWriter}
          data-origin={util.toApp(filePath)}
          href={!props.inWriter ? util.toApp(url) : undefined}
          className={`${!props.inWriter ? "glightbox ": ""}file-embed rounded ${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
          data-width="calc(90vw - 10px)"
          data-height="100vh"
          onClick={e => openLightbox(e)}
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url("${util.crop(props.file.id, 160, 160)}")`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
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
          draggable={!!props.inWriter}
          data-origin={util.toApp(filePath)}
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          class={`${!props.inWriter ? "glightbox ": ""}file-embed rounded`}
          id={props.file.id}
          data-type="image"
          onClick={e => openLightbox(e)}
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url("${util.crop(props.file.id, 160, 160)}")`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
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
          draggable={!!props.inWriter}
          data-origin={util.toApp(filePath)}
          data-type="image"
          data-srcset={`${util.thumbnail(props.file.id, 720)} 720w, ${util.thumbnail(props.file.id, 1366)} 1366w, ${util.thumbnail(props.file.id, 2048)} 2048w`}
          data-sizes="(max-width: 992px) 720px, (max-width: 1400px) 1366px, 2048px"
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          class={`${!props.inWriter ? "glightbox ": ""}file-embed rounded`}
          id={props.file.id}
          onClick={e => openLightbox(e)}
        >
          <div
            className={`miniature${props.file.removed ? " removed" : ""}`}
            style={
              `background-image:url("${util.crop(props.file.id, 160, 160)}")`
            }
          />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            onClick={e => props.toggleFile(e)}
          >
            <FaIcon family={"solid"} icon={"times"} />
          </div>
        </a>
      );
    }
  }
}
