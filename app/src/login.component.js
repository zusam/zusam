import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import alert from "./alert.js";
import router from "./router.js";

export default class Login extends Component {

    constructor() {
        super();
        this.state = {
            showAlert: false,
            error: ""
        };
        this.sendLoginForm = this.sendLoginForm.bind(this);
        this.sendPasswordReset = this.sendPasswordReset.bind(this);
        this.showPasswordReset = this.showPasswordReset.bind(this);
    }
    
    sendPasswordReset(e) {
		e.preventDefault();
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
        bee.http.post("/api/password-reset-mail", {mail: login}).then(res => {
			if (res && !res.message) {
                this.setState({
                    showAlert: true,
                    error: lang.fr["password_reset_mail_sent"]
                });
            } else {
                this.setState({
                    showAlert: true,
                    error: lang.fr[res.message]
                });
            }
        });
    }

	sendLoginForm(e) {
		e.preventDefault();
        this.setState({showAlert: false});
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
		const password = document.getElementById("password").value;
        bee.set("apiKey", "");
		bee.http.post("/api/login", {login: login, password: password}).then(res => {
			if (res && !res.message) {
				bee.set("apiKey", res.api_key);
                setTimeout(() => router.navigate("/"), 100);
            } else {
                alert.add(lang.fr[res.message]);
            }
		});
	}

    showPasswordReset() {
        this.setState({showResetPassword: true});
    }
    
    render() {
        return (
            <div class="login">
                <div class="login-form">
                    <img src="zusam_logo.svg"/>
                    { !this.state.showResetPassword && (
                        <form>
                            <div class="form-group">
                                <input type="email" class="form-control" required id="login" placeholder={lang.fr.login_placeholder} />
                            </div>
                            <div class="form-group">
                                <input type="password" class="form-control" required id="password" placeholder={lang.fr.password_placeholder} />
                            </div>
                            <span class="forgot-password" onClick={this.showPasswordReset}>{lang.fr["forgot_password"]}</span>
                            <button type="submit" class="btn btn-light" onClick={this.sendLoginForm}>{lang.fr.connect}</button>
                        </form>
                    )}
                    { !!this.state.showResetPassword && (
                        <form>
                            <div class="form-group">
                                <input type="email" class="form-control" required id="login" placeholder={lang.fr.login_placeholder} />
                            </div>
                            <button type="submit" class="btn btn-light" onClick={this.sendPasswordReset}>{lang.fr.submit}</button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
}
