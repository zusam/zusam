import { h, render, Component } from "preact";
import UserSettings from "./user-settings.component.js";
import bee from "./bee.js";

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({}, props);
        if (!this.state.key) {
            return;
        }
        bee.get(this.state.key).then(res => {
            switch (res["@type"]) {
                case "User":
                    this.state.show = "user";
                    break;
                case "Group":
                    this.state.show = "group";
                    break;
                default:
                    this.state.show = null;
            }
        });
    }

    render() {
        if (!this.state.show) {
            return;
        }
        return (
            <div class="settings">
                { this.state.show == "user" && this.state.currentUser && (
                    <UserSettings
                        {...this.state.currentUser}
                    />
                )}
            </div>
        );
    }
}
