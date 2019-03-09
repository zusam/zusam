import { h, render, Component } from "preact";
import { alert, cache, http, imageService, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class UserSettings extends Component {

    constructor(props) {
        super(props);
        this.updateSettings = this.updateSettings.bind(this);
        this.state = Object.assign({}, props);
        this.inputAvatar = this.inputAvatar.bind(this);
    }

    inputAvatar(event) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", event => {
            let img = new Image();
            img.onload = () => {
                let w = Math.min(img.naturalWidth, 256);
                let h = Math.min(img.naturalHeight, 256);
                let g = Math.min(w/img.naturalWidth, h/img.naturalHeight);
                let nw = Math.floor(img.naturalWidth*g);
                let nh = Math.floor(img.naturalHeight*g);
                imageService.resize(img, nw, nh, blob => {
                    const formData = new FormData();
                    formData.append("file", blob);
                    http.post("/api/files/upload", formData, false).then(file => {
                        http.put("/api/users/" + this.state.id, {avatar: file["@id"]}).then(res => {
                            this.setState({avatar: file});
                            cache.resetCache();
                            alert.add(lang["settings_updated"]);
                        });
                    });
                });
            }
            img.src = URL.createObjectURL(event.target.files[0]);
        });
        input.click();
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
        http.put("/api/users/" + this.state.id, user).then(res => {
            this.setState(Object.assign(this.state, res));
            alert.add(lang["settings_updated"]);
            me.update();
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
                                        src={ this.state.avatar ? util.crop(this.state.avatar["@id"], 100, 100) : util.defaultAvatar }
                                        onError={e => e.currentTarget.src = util.defaultAvatar}
                                        onClick={this.inputAvatar}
                                    />
                                </div>
                                <div class="col-12 col-md-10">
                                    <form id="settings_form">
                                        <div class="form-group">
                                            <label for="name">{lang["name"]}: </label>
                                            <input
                                                type="text"
                                                name="name"
                                                minlength="1"
                                                maxlength="128"
                                                placeholder={lang["name_input"]}
                                                value={this.state.name}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <div class="form-group">
                                            <label for="email">{lang["email"]}: </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder={lang["email_input"]}
                                                value={this.state.login}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <div class="form-group">
                                            <label for="password">{lang["password"]}: </label>
                                            <input
                                                type="password"
                                                name="password"
                                                autocomplete="new-password"
                                                minlength="8"
                                                maxlength="128"
                                                placeholder={lang["password_input"]}
                                                class="form-control"
                                            ></input>
                                        </div>
                                        <button onClick={this.updateSettings} class="btn btn-primary">{lang["save_changes"]}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                { this.state.alert && (
                    <div class="global-alert alert alert-success">
                        { this.state.alert }
                    </div>
                )}
            </div>
        );
    }
}
