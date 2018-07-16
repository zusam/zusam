import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";

export default class GroupSettings extends Component {

    constructor(props) {
        super(props);
        this.updateSettings = this.updateSettings.bind(this);
        this.state = Object.assign({}, props);
    }

    updateSettings(event) {
        event.preventDefault();
        const name = document.querySelector("#settings_form input[name='name']").value;
        let group = {};
        if (name) {
            group.name = name;
        }
        bee.http.put("/api/groups/" + this.state.id, group).then(res => {
            this.setState(Object.assign(this.state, res));
        });
    }

    render() {
        return (
            <div class="group-settings">
                <div class="card">
                    <div class="identite card-body">
                        <div class="container-fluid p-1">
                            <div class="row">
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
