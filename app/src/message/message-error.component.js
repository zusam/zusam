import { h } from "preact";
import { useTranslation } from "react-i18next";

export default function MessageError(props) {

  const { t } = useTranslation();

  const getError = (error) => {
    switch (error?.type) {
    case "invalid_token":
      return t("invalid_token_error");
    case "Public links are disabled":
      return t("public_links_disabled");
    default:
      return t("error");
    }
  };

  return (
    <div class="message">
      <div class="message-body">
        <p class="card-text">{getError(props.error)}</p>
      </div>
    </div>
  );
}
