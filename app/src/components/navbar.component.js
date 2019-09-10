import { h, render, Component } from "preact";
import { me, router, util } from "/core";
import FaIcon from "./fa-icon.component.js";
import Notification from "./notification.component.js";

export default class Navbar extends Component {

    constructor(props) {
        super(props);
        this.clickBackButton = this.clickBackButton.bind(this);
        this.onMeStateChange = this.onMeStateChange.bind(this);
        window.addEventListener("meStateChange", this.onMeStateChange);
    }

    clickBackButton(evt) {
        evt.preventDefault();
        if (router.backUrlPrompt && !confirm(router.backUrlPrompt)) {
            return false;
        }
        router.onClick(evt);
    }

    onMeStateChange() {
        // force update the navbar when me gets updated
        this.setState({});
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
                                <a class="d-block seamless-link"
                                    href={"/users/" + me.me.id + "/settings"}
                                    onClick={router.onClick}
                                >{lang["settings"]}</a>
                                <a class="d-block seamless-link" href="/logout" onClick={router.onClick}>{lang["logout"]}</a>
                            </div>
                        </div>
                    )}
                    { router.backUrl && (
                        <a class="seamless-link back" href={router.backUrl} onClick={this.clickBackButton}>
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
                            {me.me.notifications.sort((a, b) => b.createdAt - a.createdAt).map(e => <Notification {...e}/>)}
                        </div>
                    </div>
                </div>
                <div class="navbar-block">
                    { me.me.groups && (
                        <div
                            class="nav-link dropdown groups unselectable" tabindex="-1"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class="unselectable">
                                { lang.groups } <FaIcon family={"solid"} icon={"caret-down"}/>
                            </div>
                            <div class="dropdown-menu dropdown-left">
                                { me.me.groups.map(
                                    e => (
                                        <a
                                            class="d-block seamless-link unselectable"
                                            href={"/groups/" + e.id}
                                            onClick={router.onClick}
                                        >{e.name}</a>
                                    )
                                )}
                                <a class="seamless-link unselectable" href="/create-group" onClick={router.onClick}>{"+ " + lang["create_a_group"]}</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
