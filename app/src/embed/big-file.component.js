import { h } from "preact";
import { util } from "/src/core";
import { FaIcon } from "/src/misc";
import { useTranslation } from "react-i18next";

export default function BigFile(props) {

  const { t } = useTranslation();
  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;

  if (props.file.contentUrl) {
    if (/video/.test(props.file.type)) {
      if (props.file.status == "ready") {
        return (
          <video
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
          href={!props.inWriter ? util.toApp(url) : undefined}
          className={`glightbox file-embed pdf-outline image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
          data-width="calc(90vw - 10px)"
          data-height="100vh"
        >
          <img class="img-fluid" src={util.thumbnail(props.file.id, 210*2, 497*2)} />
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

      if (props.file.type == "image/gif") {
        return (
          <a
            data-origin={util.toApp(filePath)}
            href={!props.inWriter ? util.toApp(filePath) : undefined}
            className={`glightbox file-embed image${props.file.removed ? " removed" : ""}`}
            id={props.file.id}
            data-type="image"
          >
            <img class="img-fluid" src={util.toApp(filePath)} />
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

      return (
        <a
          data-origin={util.toApp(filePath)}
          data-type="image"
          data-srcset={`${util.thumbnail(props.file.id, 720)} 720w, ${util.thumbnail(props.file.id, 1366)} 1366w, ${util.thumbnail(props.file.id, 2048)} 2048w`}
          data-sizes="(max-width: 992px) 720px, (max-width: 1400px) 1366px, 2048px"
          href={!props.inWriter ? util.toApp(filePath) : undefined}
          className={`glightbox file-embed image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
        >
          <img class="img-fluid" src={util.thumbnail(props.file.id, 720)} />
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
