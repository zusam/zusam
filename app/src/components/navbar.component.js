import { h, render, Component } from "preact";
import { lang, me, router, util } from "/core";
import FaIcon from "./fa-icon.component.js";
import Search from "./search.component.js";
import GroupsDropdownNavbar from "./groups-dropdown-navbar.component.js";
import NotificationsDropdownNavbar from "./notifications-dropdown-navbar.component.js";

export default class Navbar extends Component {

    constructor(props) {
        super(props);
        this.clickBackButton = this.clickBackButton.bind(this);
        // force update the navbar when me gets updated
        addEventListener("meStateChange", _ => this.setState({}));
    }

    clickBackButton(evt) {
        evt.preventDefault();
        if (router.backUrlPrompt && !confirm(router.backUrlPrompt)) {
            return false;
        }
        router.onClick(evt);
    }

    render() {
        return (
            <div class="main-nav nav align-items-center z-index-100">
                <div class="navbar-block">
                    { !router.backUrl && (
                        <div
                            class="menu dropdown cursor-pointer" tabindex="-1"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class="rounded-circle avatar unselectable">
                                <img
                                    class="rounded-circle"
                                    src={me.me.avatar ? util.crop(me.me.avatar["id"], 80, 80) : util.defaultAvatar}
                                    onError={e => e.currentTarget.src = util.defaultAvatar}
                                />
                            </div>
                            <div class="dropdown-menu dropdown-right">
                                <a
                                    class="d-block seamless-link"
                                    href={router.toApp("/users/" + me.me.id + "/settings")}
                                    onClick={e => router.onClick(e)}
                                >
                                    {lang.t("settings")}
                                </a>
                                <a
                                    class="d-block seamless-link"
                                    href={router.toApp("/logout")}
                                    onClick={e => router.onClick(e)}
                                >
                                    {lang.t("logout")}
                                </a>
                            </div>
                        </div>
                    )}
                    { ["groups", "messages"].includes(router.route) && router.backUrl && (
                        <a
                            class="seamless-link back"
                            href={router.toApp(router.backUrl)}
                            onClick={e => this.clickBackButton(e)}
                        >
                            <FaIcon family={"solid"} icon={"arrow-left"}/>
                        </a>
                    )}
                    <NotificationsDropdownNavbar />
                </div>
                { !router.backUrl && <Search />}
                <GroupsDropdownNavbar />
            </div>
        );
    }
}
