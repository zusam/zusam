import { h } from "preact";
import { BigFile, MiniFile } from "/src/embed";
import { useEffect } from "preact/hooks";
import GLightbox from 'glightbox';

export default function FileGrid(props) {

  useEffect(() => {
    const lightbox = GLightbox({
      autoplayVideos: false,
      draggable: true,
      loop: false,
      selector: ".glightbox",
      touchNavigation: true,
      zoomable: true,
    });
  });

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
          .sort((a, b) => (a.fileIndex > b.fileIndex ? 1 : -1))
          .map(e => <MiniFile key={e.id} toggleFile={toggleFile} file={e} inWriter={props.inWriter} />)}
      </div>
    );
  }
  return (
    <div class="d-flex justify-content-center flex-wrap">
      {props.files
        .sort((a, b) => (a.fileIndex > b.fileIndex ? 1 : -1))
        .map(e => <BigFile key={e.id} toggleFile={toggleFile} file={e} inWriter={props.inWriter} />)}
    </div>
  );
}
