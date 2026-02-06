import { h } from "preact";
import { useEffect, useLayoutEffect, useRef } from "preact/hooks";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor(
  { editorRef, readOnly, defaultValue, onTextChange, onSelectionChange }) {
  const containerRef = useRef(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    editorRef.current?.enable(!readOnly);
  }, [editorRef, readOnly]);

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );
    const quill = new Quill(editorContainer, {
      theme: "snow",
    });
    if (editorRef) editorRef(quill);

    if (defaultValueRef.current) {
      quill.setContents(defaultValueRef.current);
    }

    quill.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
      onSelectionChangeRef.current?.(...args);
    });

    return () => {
      editorRef.current = null;
      container.innerHTML = "";
    };
  }, []);

  return <div class="quill-container" ref={containerRef}></div>;
}