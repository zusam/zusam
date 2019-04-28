import { h, render, Component } from "preact";
import { http, router } from "/core";

export default class CreateGroup extends Component {

    constructor() {
        super();
        this.postNewGroup = this.postNewGroup.bind(this);
    }

    postNewGroup(event) {
        event.preventDefault();
        const name = document.querySelector("#create_group_form input[name='name']").value;
        console.log(name);
        let group = {};
        if (name) {
            group.name = name;
        } else {
            return false;
        }
        group.createdAt = Math.floor(Date.now()/1000);
        http.post("/api/groups", group).then(res => {
            console.log(res);
            http.post("/api/groups/invitation/" + res.secretKey, {}).then(res => {
                console.log(res);
                window.location = "/groups/" + res.id;
            });
        });
    }

    render() {
        return (
            <div class="container mt-1">
                <div class="group-settings">
                    <div class="card">
                        <div class="card-body">
                            <div class="container-fluid p-1">
                                <div class="row">
                                    <div class="col-12 col-md-10">
                                        <form id="create_group_form" class="mb-1">
                                            <div class="form-group">
                                                <label for="name">{lang["name"]}: </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    minlength="1"
                                                    maxlength="128"
                                                    placeholder={lang["name_input"]}
                                                    class="form-control"
                                                    required
                                                ></input>
                                            </div>
                                            <button onClick={this.postNewGroup} class="btn btn-primary">{lang["create_the_group"]}</button>
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
