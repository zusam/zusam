import { h, render, Component } from "preact";
import lang from "./lang.js";
import cache from "./cache.js";
import router from "./router.js";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";
import FaIcon from "./fa-icon.component.js";

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({groups: []}, props);
        if (!this.state.key) {
            return;
        }
        cache.get(this.state.key).then(res => this.setState({entity: res}));
    }

    render() {
        if (!this.state.entity || !this.state.currentUser) {
            return;
        }
        return (
            <div class="settings">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a
                            class={ "nav-link" + (this.state.entity["@type"] == "User" ? " active" : "")}
                            href={router.toApp(this.state.currentUser["@id"]) + "/settings"}
                            onClick={router.onClick}
                        >{lang.fr["account"]}</a>
                    </li>
                    { this.state.groups.length > 0 && (
                        <li
                            class="nav-item dropdown group-list" tabindex="-1"
                            onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                            onClick={e => e.currentTarget.classList.toggle("active")}
                        >
                            <div class={"nav-link" + (this.state.entity["@type"] == "Group" ? " active" : "")}>{ lang.fr.groups }</div>
                            <div class="dropdown-menu">
                                { Array.isArray(this.state.groups) && this.state.groups.map(
                                    e => (
                                        <a
                                            class="seamless-link"
                                            href={router.toApp(e["@id"]) + "/settings"}
                                            onClick={router.onClick}
                                        >{e.name}</a>
                                    )
                                )}
                            </div>
                        </li>
                    )}
                </ul>
                { this.state.entity["@type"] === "User" && (
                    <UserSettings
                        {...this.state.entity}
                    />
                )}
                { this.state.entity["@type"] === "Group" && (
                    <GroupSettings
                        {...this.state.entity}
                    />
                )}
            </div>
        );
    }
}
