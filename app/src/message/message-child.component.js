import { h } from "preact";
import Message from "./message.component.js";

export default function MessageChild(props) {
  return (
    <Message
      id={props.id}
      isChild={true}
    />
  );
}
