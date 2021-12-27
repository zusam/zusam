import { h } from "preact";
import { util } from "/src/core";
import { FaIcon } from "/src/misc";

export default function BigFile(props) {

  const filePath = props.file.contentUrl ? `/files/${props.file.contentUrl}` : null;
  let url = filePath;

  if (/image/.test(props.file.type) && props.file.type != "image/gif") {
    // no limit in height for long format images
    url = util.thumbnail(props.file.id, 1366, 999999);
  }

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
            {this.props.t("video_not_ready")}
          </div>
        </a>
      );
    }
    if (/pdf/.test(props.file.type)) {
      return (
        <a
          data-nlg={!this.props.inWriter}
          data-origin={util.toApp(filePath)}
          href={!this.props.inWriter ? util.toApp(url) : undefined}
          className={`file-embed pdf-outline image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
        >
          <img class="img-fluid" src={util.thumbnail(props.file.id, 210*2, 497*2)} />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            fileIndex={props.file.fileIndex}
            onClick={e => this.toggleFile(e)}
          >
            <FaIcon family={"solid"} icon={"times"} />
          </div>
        </a>
      );
    }
    if (/image/.test(props.file.type)) {
      return (
        <a
          data-nlg={!this.props.inWriter}
          data-origin={util.toApp(filePath)}
          href={!this.props.inWriter ? util.toApp(url) : undefined}
          className={`file-embed image${props.file.removed ? " removed" : ""}`}
          id={props.file.id}
        >
          <img class="img-fluid" src={url} />
          <div
            class="remove-button"
            style={props.file.removed ? "color:red" : ""}
            fileIndex={props.file.fileIndex}
            onClick={e => this.toggleFile(e)}
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
