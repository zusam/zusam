import { h } from "preact";
import { useTranslation } from "react-i18next";

export default function MessageError(props) {

  const { t } = useTranslation();

  const getError = (error) => {
    switch (error?.type) {
    case "invalid_token":
      return t("invalid_token_error");
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
