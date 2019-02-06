import { h, render, Component } from "preact";
import { alert, cache, http, lang, router } from "/core";

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
        // reroute if already logged in
        cache.get("apiKey").then(apiKey => apiKey && router.navigate("/"));
    }
    
    sendPasswordReset(e) {
		e.preventDefault();
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
        this.setState({sending: true});
        http.post("/api/password-reset-mail", {mail: login}).then(res => {
            this.setState({sending: false});
			if (res && !res.message) {
                alert.add(lang["password_reset_mail_sent"]);
            } else {
                alert.add(lang[res.message], "alert-danger");
            }
        });
    }

	sendLoginForm(e) {
		e.preventDefault();
        this.setState({showAlert: false, sending: true});
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
		const password = document.getElementById("password").value;
        cache.set("apiKey", "");
		http.post("/api/login", {login: login, password: password}).then(res => {
            this.setState({sending: false});
			if (res && !res.message) {
				cache.set("apiKey", res.api_key);
                setTimeout(() => router.navigate("/"), 100);
            } else {
                alert.add(lang[res.message], "alert-danger");
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
                                <input type="email" class="form-control" required id="login" placeholder={lang.login_placeholder} />
                            </div>
                            <div class="form-group">
                                <input type="password" class="form-control" required id="password" placeholder={lang.password_placeholder} />
                            </div>
                            <div class="forgot-password"><span onClick={this.showPasswordReset}>{lang["forgot_password"]}</span></div>
                            <button type="submit" class="btn btn-light" onClick={this.sendLoginForm} disabled={this.state.sending}>
                                {lang.connect}
                            </button>
                        </form>
                    )}
                    { !!this.state.showResetPassword && (
                        <form>
                            <div class="form-group">
                                <input type="email" class="form-control" required id="login" placeholder={lang.login_placeholder} />
                            </div>
                            <button type="submit" class="btn btn-light" onClick={this.sendPasswordReset} disabled={this.state.sending}>
                                {lang.submit}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
}
