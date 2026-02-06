import { h } from "preact";
import { useEffect, useLayoutEffect, useRef } from "preact/hooks";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );
    const quill = new Quill(editorContainer, {
      theme: "snow",
    });
    if (props.editorRef) props.editorRef(quill);

    if (props.defaultValue) {
      console.log("set editor", props.defaultValue);
      quill.setContents(props.defaultValue);
    }
    return () => {
      props.editorRef.current = null;
      container.innerHTML = "";
    };
  }, []);

  return <div class="quill-container" ref={containerRef}></div>;
}