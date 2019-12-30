import { h, render, Component } from "preact";
import { lang, me, router, util } from "/core";
import FaIcon from "./fa-icon.component.js";
import Notification from "./notification.component.js";

export default class Navbar extends Component {

    constructor(props) {
        super(props);
        this.clickBackButton = this.clickBackButton.bind(this);
        this.search = this.search.bind(this);
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

    search(evt) {
        evt.preventDefault();
        // https://stackoverflow.com/a/37511463
        let search = document.getElementById('search').value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(" ");
        let searchTerms = [];
        let hashtags = [];
        search.map(e => {
            if (e.startsWith('#')) {
                hashtags.push(e.slice(1));
            } else {
                searchTerms.push(e);
            }
        });
        let group_id = router.route == "messages" ? router.entity.group.id : router.entity.id;
        router.navigate(
            "/groups/" + group_id
            + "?search=" + encodeURI(searchTerms.join('+'))
            + "&hashtags=" + encodeURI(hashtags.join('+'))
        );
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
                    <div
                        className={
                            "menu dropdown" + (me.me.notifications.length ? " cursor-pointer" : "")
                        }
                        tabindex="-1"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => me.me.notifications.length && e.currentTarget.classList.toggle("active")}
                    >
                        <div class="unselectable notification-button">
                            <FaIcon family={me.me.notifications.length ? "solid" : "regular"} icon={"bell"}/>
                        </div>
                        <div class="dropdown-menu dropdown-right notifications-menu">
                            {me.me.notifications.sort((a, b) => b.createdAt - a.createdAt).map(e => <Notification key={e.id} {...e}/>)}
                        </div>
                    </div>
                </div>
                { !router.backUrl && (
                    <form class="navbar-block search-block">
                        <div class="input-group">
                            <input
                                class="form-control"
                                type="text"
                                id="search"
                                placeholder={lang.t("search_in_group")}
                                value={
                                    router.getParam('search').replace(/\+/g," ")
                                        + (
                                            router.getParam('hashtags') ?
                                            " #" + router.getParam('hashtags').replace(/\+/g," #")
                                            : ""
                                        )
                                }
                            ></input>
                            <div class="input-group-append">
                                <button
                                    onClick={e => this.search(e)}
                                    class="btn btn-secondary"
                                    type="submit"
                                >
                                    <FaIcon family={"solid"} icon={"search"}/>
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                <div class="navbar-block">
                    { me.me.groups && (
                        <div
                            class="nav-link dropdown groups unselectable" tabindex="-1"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class="unselectable pr-5px">
                                { lang.t("groups") } <FaIcon family={"solid"} icon={"caret-down"}/>
                            </div>
                            <div class="dropdown-menu dropdown-left">
                                { me.me.groups.map(
                                    e => (
                                        <a
                                            class="d-block seamless-link unselectable"
                                            href={router.toApp("/groups/" + e.id)}
                                            onClick={e => router.onClick(e)}
                                        >
                                            {e.name}
                                        </a>
                                    )
                                )}
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
            </div>
        );
    }
}
