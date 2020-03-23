import { h, render, Component } from "preact";
import { lang, me, router } from "/core";
import { FaIcon } from "/misc";

export default class GroupsDropdownNavbar extends Component {
  constructor(props) {
    super(props);
    // force update the navbar when me gets updated
    addEventListener("meStateChange", _ => this.setState({}));
  }

  render() {
    return (
      <div class="navbar-block">
        {me.me.groups && (
          <div
            class="nav-link dropdown groups unselectable"
            tabindex="-1"
            onClick={e => e.currentTarget.classList.toggle("active")}
          >
            <div class="unselectable pr-1">
              {lang.t("groups")} <FaIcon family={"solid"} icon={"caret-down"} />
            </div>
            <div class="dropdown-menu dropdown-left">
              {me.me.groups.map(e => (
                <a
                  class="d-block seamless-link unselectable"
                  href={router.toApp("/groups/" + e.id)}
                  onClick={e => router.onClick(e)}
                >
                  {e.name}
                </a>
              ))}
              <a
                class="seamless-link unselectable"
                href={router.toApp("/create-group")}
                onClick={e => router.onClick(e)}
              >
                {"+ " + lang.t("create_a_group")}
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
}
