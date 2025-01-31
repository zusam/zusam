import { h, Fragment } from "preact";
import { util, me, notifications, alert, api } from "/src/core";
import { Link } from "react-router-dom";
import { FaIcon } from "/src/misc";
import { useTranslation } from "react-i18next";
import { HumanTime } from "/src/pages";
import { useStoreon } from "storeon/preact";
import store from "/src/store";
import MessageEmojiSelector from "./message-emojipicker.component";

export default function MessageFooter(props) {

  const { t } = useTranslation();
  const { bookmarks } = useStoreon("bookmarks");

  return (
    <div class="message-footer">
      <div class="infos">
        {!props?.isPublic && props?.author && props?.author?.id === me.id && (
          <Fragment>
            <a
              class="action seamless-link font-size-90 capitalize d-none d-sm-block"
              onClick={e => props.editMessage(e)}
            >
              {t("edit")}
            </a>
            <div class="dot d-none d-sm-block">&bull;</div>
          </Fragment>
        )}
        {!props?.isPublic && props?.isChild && props?.message && (
          <Fragment>
            <Link
              class="action seamless-link font-size-90 capitalize"
              to={
                `/messages/${props?.message.id}${props?.message?.children.length ? "" : "?focus=reply"}`
              }
            >
              {props?.message?.children.length ? (
                props.message.children.some(e => notifications.isNew(e.id)) ? (
                  <b>
                    {t("replies", {
                      count: props.message.children.length
                    })}
                  </b>
                ) : (
                  t("replies", {
                    count: props.message.children.length
                  })
                )
              ) : (
                t("reply")
              )}
            </Link>
            <div class="dot">&bull;</div>
          </Fragment>
        )}
        <div
          class="date font-size-90"
          title={util.humanFullDate(props?.message.createdAt)}
        >
          <HumanTime timestamp={props?.message.createdAt} />
        </div>
        <Fragment>
          <div class="dot">&bull;</div>
          <div class="font-size-90">
            {
              props?.author && props?.author?.name ? props.author.name : "--"
            }
          </div>
        </Fragment>
        {!props?.isPublic && (
          <Fragment>
            <div class="dot">&bull;</div>
            <div class="font-size-90">
              <MessageEmojiSelector messageId={props?.message.id} />
            </div>
          </Fragment>
        )}
      </div>
      <div>
        {!props?.isPublic && (
          <div
            class="options dropdown"
            onClick={e =>
              e?.target?.closest(".dropdown")?.classList.toggle("active")
            }
          >
            <div class="none-if-follows-empty">
              <FaIcon family="solid" icon="ellipsis-h" />
            </div>
            <div class="dropdown-menu dropdown-options">
              {props?.author && props?.author?.id === me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => props.deleteMessage(e)}
                >
                  {t("delete")}
                </a>
              )}
              {api?.info?.allow_public_links && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => props.openPublicLink(e)}
                >
                  {t("public_link")}
                </a>
              )}
              {me.groups?.length > 1 && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => props.shareMessage(e)}
                >
                  {t("share_message")}
                </a>
              )}
              {!props?.message?.isInFront &&
                  props?.author &&
                  props?.author.id == me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => props.publishInGroup(e)}
                >
                  {t("publish_in_group")}
                </a>
              )}
              {!bookmarks.some(b => b.message.id === props?.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => {
                    alert.add(t("bookmark_added"));
                    store.dispatch("bookmark/add", props.message.id);
                  }}
                >
                  {t("add_bookmark")}
                </a>
              )}
              {bookmarks.some(b => b.message.id === props?.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => {
                    alert.add(t("bookmark_removed"));
                    store.dispatch("bookmark/remove", bookmarks.find(b => b.message.id === props.message.id));
                  }}
                >
                  {t("remove_bookmark")}
                </a>
              )}
              {props?.author?.id == me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => props.editMessage(e)}
                >
                  {t("edit")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
