import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import router from "./router.js";

export default class ResetPassword extends Component {

    constructor() {
        super();
    }

	sendNewPassword(e) {
		e.preventDefault();
        bee.set("apiKey", "");
		const password = document.getElementById("password").value || "";
		const passwordConfirmation = document.getElementById("password_confirmation").value || "";
        const mail = router.getParam("mail");
        const key = router.getParam("key");
        if (mail && password && key && password === passwordConfirmation) {
            bee.http.post("/api/new-password", {mail: mail, key: key, password: password}).then(res => {
                if (res) {
                    bee.set("apiKey", res.api_key);
                    setTimeout(() => router.navigate("/"), 100);
                }
            }).catch(res => console.warn(res));
        }
	}
    
    render() {
        return (
            <div class="login">
                <div class="login-form">
                    <h2 class="title">{lang.fr["reset_password_title"]}</h2>
                    <form>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password" placeholder={lang.fr.new_password_placeholder} />
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password_confirmation" placeholder={lang.fr.confirm_password_placeholder} />
                        </div>
                        <button type="submit" class="btn btn-light" onClick={this.sendNewPassword}>{lang.fr.submit}</button>
                    </form>
                </div>
            </div>
        );
    }
}
