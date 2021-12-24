import { h, Fragment } from "preact";
import { util } from "/src/core";
import { useTranslation } from "react-i18next";

export default function HumanTime(props) {

  const { t } = useTranslation();

  // duration relative to event
  const humanTime = timestamp => {
    if (!timestamp) {
      return null;
    }
    const duration = Math.abs(Math.round((Date.now() / 1000 - timestamp) / 60));
    if (duration < 1) {
      return t("just_now");
    }
    if (duration < 60) {
      return t("ago", { duration: `${duration  }mn` });
    }
    if (duration < 60 * 24) {
      return t("ago", { duration: `${Math.floor(duration / 60)  }h` });
    }
    return util.humanFullDate(timestamp).split(" ")[0];
  };

  return (
    <Fragment>{humanTime(props.timestamp)}</Fragment>
  );
}
