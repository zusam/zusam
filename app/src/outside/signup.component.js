import { h, Component } from "preact";
import { alert, storage, http, router } from "/src/core";
import { withTranslation } from 'react-i18next';

class Signup extends Component {
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
    this.setState({ showAlert: false });
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    const password = document.getElementById("password").value;
    storage.set("apiKey", "");
    http
      .post("/api/signup", {
        login,
        password,
        invite_key: this.state.inviteKey
      })
      .then(res => {
        if (res && !res.message) {
          storage.set("apiKey", res.api_key);
          setTimeout(() => this.props.history.push("/"), 100);
        } else {
          alert.add(this.props.t(res.message));
        }
      });
  }

  render() {
    return (
      <div class="signup">
        <div class="signup-form">
          <img src="/src/assets/zusam_logo.svg" />
          <div class="welcome lead">{this.props.t("invitation_welcome")}</div>
          <form>
            <div class="form-group">
              <input
                type="email"
                class="form-control"
                required
                id="login"
                placeholder={this.props.t("login_placeholder")}
              />
            </div>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                required
                id="password"
                placeholder={this.props.t("password_placeholder")}
              />
            </div>
            <button
              type="submit"
              class="btn btn-light"
              onClick={e => this.sendSignupForm(e)}
            >
              {this.props.t("signup")}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Signup);
