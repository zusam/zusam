import { h } from "preact";
import { BigFile, MiniFile } from "/src/embed";

export default function FileGrid(props) {

  const toggleFile = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (typeof props.toggleFile == "function") {
      props.toggleFile(evt.target.closest(".file-embed").id);
    }
  };

  if (!props.files || props.files.length === 0) {
    return null;
  }
  if (props.files && props.files.length > 3) {
    return (
      <div class="file-grid">
        {props.files
          .map(e => (
            <MiniFile
              key={e.id}
              invertFiles={props.invertFiles}
              toggleFile={toggleFile}
              file={e}
              inWriter={props.inWriter}
            />
          ))}
      </div>
    );
  }
  return (
    <div class="d-flex justify-content-center flex-wrap">
      {props.files
        .map(e => (
          <BigFile
            key={e.id}
            toggleFile={toggleFile}
            invertFiles={props.invertFiles}
            file={e}
            inWriter={props.inWriter}
          />
        ))}
    </div>
  );
}
