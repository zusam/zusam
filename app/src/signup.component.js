import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";

export default class Signup extends Component {

    constructor() {
        super();
        this.state = {
            showAlert: false,
            error: "",
            inviteKey: router.getParam("inviteKey")
        };
        this.sendSignupForm = this.sendSignupForm.bind(this);
    }

	sendSignupForm(e) {
		e.preventDefault();
        this.setState({showAlert: false});
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
		const password = document.getElementById("password").value;
        bee.set("apiKey", "");
		bee.http.post("/api/signup", {login: login, password: password, invite_key: this.state.inviteKey}).then(res => {
			if (res && !res.message) {
				bee.set("apiKey", res.api_key);
                setTimeout(() => router.navigate("/"), 100);
            } else {
                this.setState({
                    showAlert: true,
                    error: lang.fr[res.message]
                });
            }
		});
	}
    
    render() {
        return (
            <div class="signup">
                <div class="signup-form">
                    <img src="zusam_logo.svg"/>
                    <div class="welcome lead">{lang.fr["invitation_welcome"]}</div>
                    <form>
                        <div class="form-group">
                            <input type="email" class="form-control" required id="login" placeholder={lang.fr.login_placeholder} />
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password" placeholder={lang.fr.password_placeholder} />
                        </div>
                        <button type="submit" class="btn btn-light" onClick={this.sendSignupForm}>{lang.fr.signup}</button>
                    </form>
                </div>
                { this.state.showAlert && (
                    <div class="global-alert alert alert-danger">
                        { this.state.error }
                    </div>
                )}
            </div>
        );
    }
}
