import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class Navbar extends Component {

    render() {
        return (
            <div class="nav align-items-center shadow-sm">
                <div class="avatar">
                    <img class="rounded-circle" src={ bee.crop(this.props.currentUser.avatar, 80, 80) }/>
                </div>
                { this.props.route === "messages" && (
                    <a class="seamless-link back" href={router.toApp(this.props.res.group)} onClick={router.onClick}>
                        <FaIcon family={"solid"} icon={"arrow-left"}/>
                    </a>
                )}
                { this.props.route === "groups" && <span class="title">{this.props.res.name}</span> }
                <div
                    class="nav-link dropdown groups" tabindex="0"
                    onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                    onClick={e => e.currentTarget.classList.toggle("active")}
                >
                    <div>{ lang.fr.groups } <FaIcon family={"solid"} icon={"caret-down"}/></div>
                    <div class="dropdown-menu">
                        { this.props.groups && this.props.groups["hydra:member"] && this.props.groups["hydra:member"].map(
                            e => <a class="seamless-link" href={router.toApp(e["@id"])} onClick={router.onClick}>{e.name}</a>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
