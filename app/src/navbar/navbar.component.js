import { h } from "preact";
import { router, util, me } from "/src/core";
import { Search } from "/src/pages";
import { GroupsDropdownNavbar, NotificationsDropdownNavbar } from "/src/navbar";
import { Link } from "react-router-dom";
import { connectStoreon } from "storeon/preact";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { t } = useTranslation();
  return (
    <div class="main-nav nav align-items-center z-index-100">
      <div class="navbar-block">
        <div
          class="menu dropdown cursor-pointer"
          tabindex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div class="rounded-circle avatar unselectable">
            <img
              class="rounded-circle"
              style={util.backgroundHash(me.id)}
              src={
                me.avatar
                  ? util.crop(me.avatar["id"], 80, 80)
                  : util.defaultAvatar
              }
              onError={e => (e.currentTarget.src = util.defaultAvatar)}
            />
          </div>
          <div class="dropdown-menu dropdown-right">
            { me.data?.bookmarks?.length && (
              <Link
                class="d-block seamless-link capitalize"
                to={"/bookmarks"}
              >
                {t("bookmarks")}
              </Link>
            )}
            <Link
              class="d-block seamless-link capitalize"
              to={`/users/${me.id}/settings`}
            >
              {t("settings")}
            </Link>
            <Link
              class="d-block seamless-link capitalize"
              to={"/logout"}
            >
              {t("logout")}
            </Link>
          </div>
        </div>
        <NotificationsDropdownNavbar />
      </div>
      { ["messages", "groups"].includes(router.route) && (
        <Search />
      )}
      <div class="navbar-block">
        <GroupsDropdownNavbar groups={me.groups} />
      </div>
    </div>
  );
}

export default connectStoreon("me", Navbar);
