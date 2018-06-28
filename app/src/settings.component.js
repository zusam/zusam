import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";

export default class Settings extends Component {

    render() {
        return (
            <div class="card">
                <div class="identite card-body">
                    <div class="container-fluid p-1">
                        <div class="row">
                            <div class="col-12 col-md-2">
                                <img
                                    class="rounded-circle material-shadow avatar"
                                    src={ bee.crop(this.props.avatar, 100, 100) }
                                />
                            </div>
                            <div class="col-12 col-md-10">
                                <form>
                                    <div class="form-group">
                                        <label for="name">{lang.fr["name"]}: </label>
                                        <input
                                            type="text"
                                            name="name"
                                            minlength="1"
                                            maxlength="128"
                                            placeholder={lang.fr["name_input"]}
                                            value={this.props.name}
                                            class="form-control"
                                        ></input>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">{lang.fr["email"]}: </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder={lang.fr["email_input"]}
                                            value={this.props.login}
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
                                    <button type="submit" class="btn btn-primary">{lang.fr["save_changes"]}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
