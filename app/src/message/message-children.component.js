import { h } from "preact";
import { router, util } from "/src/core";
import MessageChild from "./message-child.component.js";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";

export default function MessageChildren(props) {

  const { t } = useTranslation();
  const [firstDisplayedChild, setFirstDisplayedChild] = useState(0);
  const [lastDisplayedChild, setLastDisplayedChild] = useState(0);

  const onNewChild = event => {
    const newMsg = event.detail;
    if (newMsg.parent && util.getId(newMsg.parent) == props.id) {
      setLastDisplayedChild(lastDisplayedChild + 1);
    }
  };

  const displayPreviousChildren = () => {
    setFirstDisplayedChild(Math.max(0, firstDisplayedChild - 10));
  };

  const displayNextChildren = () => {
    setLastDisplayedChild(Math.min(props.childMessages.length, lastDisplayedChild + 10));
  };

  useEffect(() => {
    window.addEventListener("newChild", onNewChild);
    let firstDisplayedChild = 0;
    let lastDisplayedChild = 0;
    if (props.childMessages.length) {
      let msgIndex = router.action
        ? props.childMessages.findIndex(e => e && e.id === router.action)
        : -1;
      if (msgIndex != -1) {
        firstDisplayedChild = Math.max(0, msgIndex - 1);
        lastDisplayedChild = Math.min(
          props.childMessages.length,
          msgIndex + 1
        );
      } else {
        firstDisplayedChild = props.childMessages && props.childMessages.length - 5; // display the last 5 children
        lastDisplayedChild = props.childMessages && props.childMessages.length;
      }
    }
    setFirstDisplayedChild(firstDisplayedChild);
    setLastDisplayedChild(lastDisplayedChild);
  }, []);

  if (
    lastDisplayedChild - firstDisplayedChild < 1 ||
    !props.childMessages
  ) {
    return null;
  }
  return (
    <div class="children">
      {firstDisplayedChild > 0 && (
        <div class="d-flex">
          <a
            class="more-coms unselectable"
            onClick={() => displayPreviousChildren()}
          >
            {t("previous_coms")}
          </a>
        </div>
      )}
      {props.childMessages.map((e, i) => {
        if (
          i < firstDisplayedChild ||
          i > lastDisplayedChild
        ) {
          return null;
        }

        return (
          <MessageChild
            id={e.id}
            key={e.id}
            isPublic={props.isPublic}
          />
        );
      })}
      {lastDisplayedChild + 1 <
        props.childMessages.length && (
        <div class="d-flex">
          <span
            class="more-coms unselectable"
            onClick={() => displayNextChildren()}
          >
            {t("next_coms")}
          </span>
        </div>
      )}
    </div>
  );
}
