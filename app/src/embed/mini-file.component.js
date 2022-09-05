import { h } from "preact";
import { util } from "/src/core";
import { FaIcon } from "/src/misc";

export default function MiniFile(props) {

  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;

  if (/image/.test(props.file.type) && props.file.type != "image/gif") {
    // no limit in height for long format images
    url = util.thumbnail(props.file.id, 1366);
  }

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
    if (/pdf/.test(props.file.type) || /video/.test(props.file.type) || props.file.type == "image/gif") {
      return (
        <a
          data-origin={util.toApp(filePath)}
          href={!props.inWriter ? util.toApp(url) : undefined}
          className={`glightbox file-embed rounded image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
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
    if (/image/.test(props.file.type) && props.file.type != "image/gif") {
      return (
        <a
          data-origin={util.toApp(filePath)}
          data-type="image"
          data-width="1366px"
          href={!props.inWriter ? util.thumbnail(props.file.id, 1366) : undefined}
          class="glightbox file-embed rounded"
          id={props.file.id}
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
