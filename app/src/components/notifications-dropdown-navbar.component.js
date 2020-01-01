import { h, render, Component } from "preact";
import { lang, me, router } from "/core";
import FaIcon from "./fa-icon.component.js";
import Notification from "./notification.component.js";

export default class NotificationsDropdownNavbar extends Component {

    constructor(props) {
        super(props);
        // force update the navbar when me gets updated
        addEventListener("meStateChange", _ => this.setState({}));
    }

    render() {
        return (
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
        );
    }
}
