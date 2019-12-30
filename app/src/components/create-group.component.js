import { h, render, Component } from "preact";
import { lang, http, router } from "/core";

export default class CreateGroup extends Component {

    constructor() {
        super();
        this.postNewGroup = this.postNewGroup.bind(this);
    }

    postNewGroup(event) {
        event.preventDefault();
        const name = document.querySelector("#create_group_form input[name='name']").value;
        let group = {};
        if (name) {
            group.name = name;
        } else {
            return false;
        }
        group.createdAt = Math.floor(Date.now()/1000);
        http.post("/api/groups", group).then(res => {
            http.post("/api/groups/invitation/" + res.secretKey, {}).then(res => {
                window.location = "/groups/" + res.id;
            });
        });
    }

    render() {
        return (
            <div class="container mt-2">
                <div class="group-settings">
                    <div class="card">
                        <div class="card-body">
                            <div class="container-fluid p-1">
                                <div class="row">
                                    <div class="col-12 col-md-10">
                                        <form id="create_group_form" class="mb-1">
                                            <div class="form-group">
                                                <label for="name">{lang.t("name")}: </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    minlength="1"
                                                    maxlength="128"
                                                    placeholder={lang.t("name_input")}
                                                    class="form-control"
                                                    required
                                                ></input>
                                            </div>
                                            <button
                                                onClick={e => this.postNewGroup(e)}
                                                class="btn btn-primary"
                                            >
                                                {lang.t("create_the_group")}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
