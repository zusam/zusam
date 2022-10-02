import { h } from "preact";
import { util } from "/src/core";
import { FaIcon } from "/src/misc";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "preact/hooks";
import GLightbox from "glightbox";

export default function BigFile(props) {

  const [lightbox, setLightbox] = useState(null);

  const { t } = useTranslation();
  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;

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

  if (props.file.contentUrl) {
    if (/video/.test(props.file.type)) {
      if (props.file.status == "ready") {
        return (
          <video
            draggable="false"
            poster={util.thumbnail(props.file.id, 1280, 720)}
            class="file-embed img-fluid contained-height video"
            controls="true"
            src={url}
            id={props.file.id}
          />
        );
      }
      return (
        <a class="file-embed image video-uploaded" id={props.file.id}>
          <img
            class="img-fluid video-raw"
            src={util.crop(props.file.id, 320, 180)}
          />
          <div class="video-not-ready">
            {t("video_not_ready")}
          </div>
        </a>
      );
    }
    if (/pdf/.test(props.file.type)) {
      return (
        <a
          data-origin={util.toApp(filePath)}
          draggable="false"
          href={!props.inWriter ? util.toApp(url) : undefined}
          className={`glightbox file-embed pdf-outline image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
          data-width="calc(90vw - 10px)"
          data-height="100vh"
          onClick={e => openLightbox(e)}
        >
          <img class="img-fluid" src={util.thumbnail(props.file.id, 210*2, 497*2)} />
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

      if (props.file.type == "image/gif") {
        return (
          <a
            data-origin={util.toApp(filePath)}
            draggable="false"
            href={!props.inWriter ? util.toApp(filePath) : undefined}
            className={`glightbox file-embed image${props.file.removed ? " removed" : ""}`}
            id={props.file.id}
            data-type="image"
            onClick={e => openLightbox(e)}
          >
            <img class="img-fluid" src={util.toApp(filePath)} />
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

      return (
        <a
          data-origin={util.toApp(filePath)}
          draggable="false"
          data-type="image"
          data-srcset={`${util.thumbnail(props.file.id, 720)} 720w, ${util.thumbnail(props.file.id, 1366)} 1366w, ${util.thumbnail(props.file.id, 2048)} 2048w`}
          data-sizes="(max-width: 992px) 720px, (max-width: 1400px) 1366px, 2048px"
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          className={`glightbox file-embed image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
          onClick={e => openLightbox(e)}
        >
          <img class="img-fluid" src={util.thumbnail(props.file.id, 720)} />
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

  if (props.file.status == "loading") {
    return (
      <div class="file-embed file-placeholder" id={props.file.id}/>
    );
  }
  return (
    <div class="file-embed file-placeholder" id={props.file.id}>
      {props.file["error"] ? (
        <div class="orange-error">&times;</div>
      ) : (
        <div class="spinner orange-spinner">
          <div /><div /><div /><div /><div />
        </div>
      )}
      <div class="progress-bar">
        <div style={{ width: `${props.file.progress}%` }} />
      </div>
    </div>
  );
}
