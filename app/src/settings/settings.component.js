import { h, render, Component } from "preact";
import { lang, cache, me, router } from "/core";
import FaIcon from "../components/fa-icon.component.js";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        if (props.entityUrl) {
            cache.get(props.entityUrl).then(res => this.setState({entity: res}));
        }
    }

    render() {
        if (!this.state.entity || !me.me) {
            return;
        }
        return (
            <div class="settings">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a
                            class={ "nav-link" + (this.state.entity["entityType"] == "user" ? " active" : "")}
                            href={router.toApp("/users/" + me.me.id + "/settings")}
                            onClick={router.onClick}
                        >{lang.t("account")}</a>
                    </li>
                    { me.me.groups.length > 0 && (
                        <li
                            class="nav-item dropdown group-list" tabindex="-1"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class={"nav-link" + (this.state.entity["entityType"] == "group" ? " active" : "")}>{ lang.t("groups") }</div>
                            <div class="dropdown-menu">
                                { me.me.groups.map(
                                    e => (
                                        <a
                                            class="seamless-link"
                                            href={router.toApp("/groups/" + e.id + "/settings")}
                                            onClick={router.onClick}
                                        >{e.name}</a>
                                    )
                                )}
                            </div>
                        </li>
                    )}
                </ul>
                { this.state.entity["entityType"] === "user" && (
                    <UserSettings
                        {...this.state.entity}
                    />
                )}
                { this.state.entity["entityType"] === "group" && (
                    <GroupSettings
                        {...this.state.entity}
                    />
                )}
            </div>
        );
    }
}
