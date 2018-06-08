import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";

export default class Login extends Component {

	sendLoginForm(e) {
		e.preventDefault();
		const login = document.getElementById("login").value;
		const password = document.getElementById("password").value;
		bee.http.post("/api/login", {login: login, password: password}).then(res => {
			if (res) {
				bee.set("apiKey", res.api_key);
                setTimeout(() => router.navigate("/"), 0);
			}
		})
	}
    
    render() {
        return (
            <div class="login">
                <div class="login-form">
                    <img src="zusam_logo.svg"/>
                    <form>
                        <div class="form-group">
                            <input type="text" class="form-control" id="login" placeholder={lang.fr.login_placeholder} />
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" id="password" placeholder={lang.fr.password_placeholder} />
                        </div>
                        <button type="submit" class="btn btn-light" onClick={this.sendLoginForm}>{lang.fr.submit}</button>
                    </form>
                </div>
            </div>
        );
    }
}
