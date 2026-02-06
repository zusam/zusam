import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillReadOnly(
  { editorRef, contents }
) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );
    const quill = new Quill(editorContainer, {
      theme: "snow",
      readOnly: true,
      modules: { toolbar: null },
    });
    if (editorRef) editorRef(quill);

    quill.setContents(contents);

    return () => {
      editorRef.current = null;
    };
  }, []);

  return <div ref={containerRef}></div>;
}