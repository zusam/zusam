import { h, render, Component } from "preact";
import lang from "./lang.js";
import util from "./util.js";
import bee from "./bee.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class Navbar extends Component {

    constructor() {
        super();
        this.clickBackButton = this.clickBackButton.bind(this);
    }

    clickBackButton(evt) {
        evt.preventDefault();
        if (this.props.backUrlPrompt && !confirm(this.props.backUrlPrompt)) {
            return false;
        }
        router.onClick(evt);
    }

    render() {
        return (
            <div class="main-nav nav align-items-center shadow-sm z-index-100">
                { this.props.currentUser && !this.props.backUrl && (
                    <div
                        class="menu dropdown" tabindex="-1"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                        <div class="rounded-circle avatar">
                            <img class="rounded-circle" src={ this.props.currentUser.avatar ? bee.crop(this.props.currentUser.avatar["@id"], 80, 80) : util.defaultAvatar }/>
                        </div>
                        <div class="dropdown-menu">
                            <a class="seamless-link"
                                href={router.toApp(this.props.currentUser["@id"])+"/settings"}
                                onClick={router.onClick}
                            >{lang.fr["settings"]}</a>
                            <a class="seamless-link" href="/logout" onClick={router.onClick}>{lang.fr["logout"]}</a>
                        </div>
                    </div>
                )}
                { this.props.backUrl && (
                    <a class="seamless-link back" href={this.props.backUrl} onClick={this.clickBackButton}>
                        <FaIcon family={"solid"} icon={"arrow-left"}/>
                    </a>
                )}
                { this.props.route == "groups" && this.props.entity && this.props.entity.name && (
                    <span class="title">
                        <span class="cursor-pointer" onClick={() => location.reload()}>
                            {this.props.entity.name}
                        </span>
                    </span>
                )}
                { this.props.groups && (
                    <div
                        class="nav-link dropdown groups" tabindex="-1"
                        onBlur={e => (!e.relatedTarget || !e.relatedTarget.href) && e.target.classList.remove("active")}
                        onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                        <div>{ lang.fr.groups } <FaIcon family={"solid"} icon={"caret-down"}/></div>
                        <div class="dropdown-menu">
                            { Array.isArray(this.props.groups) && this.props.groups.map(
                                e => (
                                    <a
                                        className={"seamless-link" + (e.hasNews ? " has-news" : "")}
                                        href={router.toApp(e["@id"])}
                                        onClick={router.onClick}
                                    >{e.name}</a>
                                )
                            )}
                            <a class="seamless-link" href="/create-group" onClick={router.onClick}>{"+ " + lang.fr["create_a_group"]}</a>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
