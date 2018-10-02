import { h, render, Component } from "preact";
import lang from "./lang.js";
import util from "./util.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";

export default class UserSettings extends Component {

    constructor(props) {
        super(props);
        this.updateSettings = this.updateSettings.bind(this);
        this.state = Object.assign({}, props);
    }

    updateSettings(event) {
        event.preventDefault();
        const name = document.querySelector("#settings_form input[name='name']").value;
        const login = document.querySelector("#settings_form input[name='email']").value;
        const password = document.querySelector("#settings_form input[name='password']").value;
        let user = {};
        if (name) {
            user.name = name;
        }
        if (login) {
            user.login = login;
        }
        if (password) {
            user.password = password;
        }
        bee.http.put("/api/users/" + this.state.id, user).then(res => {
            this.setState(Object.assign(this.state, res));
        });
    }

    render() {
        return (
            <div class="user-settings">
                <div class="card">
                    <div class="identite card-body">
                        <div class="container-fluid p-1">
                            <div class="row">
                                <div class="col-12 col-md-2">
                                    <img
                                        class="img-fluid rounded-circle material-shadow avatar"
                                        src={ bee.crop(this.state.avatar, 100, 100) || util.defaultAvatar }
                                    />
                                </div>
                                <div class="col-12 col-md-10">
                                    <form id="settings_form">
                                        <div class="form-group">
                                            <label for="name">{lang.fr["name"]}: </label>
                                            <input
                                                type="text"
                                                name="name"
                                                minlength="1"
                                                maxlength="128"
                                                placeholder={lang.fr["name_input"]}
                                                value={this.state.name}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <div class="form-group">
                                            <label for="email">{lang.fr["email"]}: </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder={lang.fr["email_input"]}
                                                value={this.state.login}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <div class="form-group">
                                            <label for="password">{lang.fr["password"]}: </label>
                                            <input
                                                type="password"
                                                name="password"
                                                autocomplete="new-password"
                                                minlength="8"
                                                maxlength="128"
                                                placeholder={lang.fr["password_input"]}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <button onClick={this.updateSettings} class="btn btn-primary">{lang.fr["save_changes"]}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
