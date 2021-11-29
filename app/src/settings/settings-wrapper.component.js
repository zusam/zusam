import { h } from "preact";
import Settings from "./user-settings.component.js";
import { useParams } from "react-router-dom";

export default function SettingsWrapper() {
  let params = useParams();
  return (
      <Settings type={params.type} id={params.id} key={params.id} />
  );
}
