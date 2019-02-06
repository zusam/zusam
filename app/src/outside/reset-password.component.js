import { h, render, Component } from "preact";
import { alert, cache, http, lang, router } from "/core";

export default class ResetPassword extends Component {

    constructor() {
        super();
        this.sendNewPassword = this.sendNewPassword.bind(this);
    }

	sendNewPassword(e) {
		e.preventDefault();
        cache.set("apiKey", "");
		const password = document.getElementById("password").value || "";
		const passwordConfirmation = document.getElementById("password_confirmation").value || "";
        const mail = router.getParam("mail");
        const key = router.getParam("key");
        if (mail && password) {
            if (password != passwordConfirmation) {
                alert.add(lang["passwords_dont_match"]);
                return;
            }
            http.post("/api/new-password", {mail: mail, key: key, password: password}).then(res => {
                if (res.api_key) {
                    cache.set("apiKey", res.api_key);
                    setTimeout(() => router.navigate("/"), 100);
                } else {
                    alert.add(lang[res.message]);
                }
            }).catch(res => console.warn(res));
        }
	}
    
    render() {
        return (
            <div class="login">
                <div class="login-form">
                    <h2 class="title">{lang["reset_password_title"]}</h2>
                    <form>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password" placeholder={lang.new_password_placeholder} />
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password_confirmation" placeholder={lang.confirm_password_placeholder} />
                        </div>
                        <button type="submit" class="btn btn-light" onClick={this.sendNewPassword}>{lang.submit}</button>
                    </form>
                </div>
            </div>
        );
    }
}
