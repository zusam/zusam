import { h, render, Component } from "preact";
import { me, alert, cache, http, router } from "/core";
import lang from "/lang";
import zusam_logo from "/assets/zusam_logo.svg";

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
		http.post("/api/login", {login: login, password: password}).then(res => {
            this.setState({sending: false});
			if (res && res.api_key) {
                cache.set("apiKey", res.api_key).then(() => {
                    me.update().then(() => {
                        setTimeout(() => router.navigate("/"), 100);
                    });
                });
            } else {
                if (res.message) {
                    alert.add(lang[res.message], "alert-danger");
                } else {
                    alert.add(lang["error"], "alert-danger");
                }
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
                    <img src={zusam_logo}/>
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
