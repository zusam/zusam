import { h, Fragment } from "preact";
import { util, me } from "/src/core";
import { Link } from "react-router-dom";
import { FaIcon } from "/src/misc";
import { useTranslation } from "react-i18next";

export default function MessageFooter() {
  const { t } = useTranslation();
  return (
    <div class="message-footer">
      <div class="infos">
        {!this.props.isPublic &&
            this.props.author &&
            this.props.author.id == me.id && (
              <Fragment>
                <a
                  class="action seamless-link font-size-90 capitalize d-none d-sm-block"
                  onClick={e => this.props.editMessage(e)}
                >
                  {t("edit")}
                </a>
                <div class="dot d-none d-sm-block">&bull;</div>
              </Fragment>
            )}
        {!this.props.isPublic && this.props.isChild && (
          <Fragment>
            <Link
              class="action seamless-link font-size-90 capitalize"
              to={
                `/messages/${this.props.message.id}${this.props.message.children.length ? "" : "?focus=reply"}`
              }
            >
              {this.props?.message?.children.length ? (
                this.props.message.children.some(e => me.isNew(e.id)) ? (
                  <b>
                    {t("replies", {
                      count: this.props.message.children.length
                    })}
                  </b>
                ) : (
                  t("replies", {
                    count: this.props.message.children.length
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
          title={util.humanFullDate(this.props.message.createdAt)}
        >
          {util.humanTime(this.props.message.createdAt)}
        </div>
        <Fragment>
          <div class="dot">&bull;</div>
          <div class="font-size-90">
            {
              this.props.author && this.props.author.name ? this.props.author.name : "--"
            }
          </div>
        </Fragment>
      </div>
      <div>
        {!this.props.isPublic && (
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
              {this.props.author && this.props.author.id == me.id && (
                <Link
                  class="seamless-link capitalize"
                  onClick={e => this.props.deleteMessage(e)}
                >
                  {t("delete")}
                </Link>
              )}
              {
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.openPublicLink(e)}
                >
                  {t("public_link")}
                </a>
              }
              {me.groups?.length > 1 && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.shareMessage(e)}
                >
                  {t("share_message")}
                </a>
              )}
              {!this.props.message.isInFront &&
                  this.props.author &&
                  this.props.author.id == me.id && (
                    <a
                      class="seamless-link capitalize"
                      onClick={e => this.props.publishInGroup(e)}
                    >
                      {t("publish_in_group")}
                    </a>
                  )}
              {!me.hasBookmark(this.props.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => me.addBookmark(this.props.message.id)}
                >
                  {t("add_bookmark")}
                </a>
              )}
              {me.hasBookmark(this.props.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => me.removeBookmark(this.props.message.id)}
                >
                  {t("remove_bookmark")}
                </a>
              )}
              {this.props.author && this.props.author.id == me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.editMessage(e)}
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
