import { h, Fragment } from "preact";
import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GroupsDropdownNavbar() {
  const { t } = useTranslation();
  return (
    <Fragment>
      {this.props.groups && (
        <div
          class="nav-link dropdown groups unselectable"
          tabindex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div class="unselectable pr-1">
            {t("groups")} <FaIcon family={"solid"} icon={"caret-down"} />
          </div>
          <div class="dropdown-menu dropdown-left">
            <Link
              to={"/feed"}
              class="seamless-link unselectable"
            >
              {`${t("feed_group")}`}
            </Link>
            {this.props.groups.filter(e => !!e).map(e => (
              <Link
                key={e.id}
                to={`/groups/${e.id}`}
                class="d-block seamless-link unselectable"
              >
                {e.name}
              </Link>
            ))}
            <Link
              to={"/create-group"}
              class="seamless-link unselectable"
            >
              {`+ ${t("create_a_group")}`}
            </Link>
          </div>
        </div>
      )}
    </Fragment>
  );
}
