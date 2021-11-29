import { h, Component } from "preact";
import { alert, storage, http, me } from "/src/core";
import { withTranslation } from 'react-i18next';

class Login extends Component {
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
    storage.get("apiKey").then(apiKey => apiKey && this.props.history.push("/"));
  }

  componentDidMount() {
    storage.reset();
  }

  sendPasswordReset(e) {
    e.preventDefault();
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    this.setState({ sending: true });
    http.post("/api/password-reset-mail", { mail: login }).then(res => {
      this.setState({ sending: false });
      if (res && !res.message) {
        alert.add(this.props.t("password_reset_mail_sent"));
      } else {
        alert.add(this.props.t(res.message), "alert-danger");
      }
    });
  }

  sendLoginForm(e) {
    e.preventDefault();
    this.setState({ showAlert: false, sending: true });
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    const password = document.getElementById("password").value;
    http.post("/api/login", { login, password }).then(res => {
      this.setState({ sending: false });
      if (res && res.api_key) {
        storage.set("apiKey", res.api_key).then(() => {
          console.log('login');
          me.update().then(() => {
            setTimeout(() => this.props.history.push("/"), 100);
          });
        });
      } else if (res && res.message) {
          alert.add(this.props.t(res.message), "alert-danger");
        } else {
          alert.add(this.props.t("error"), "alert-danger");
        }
    });
  }

  showPasswordReset() {
    this.setState({ showResetPassword: true });
  }

  render() {
    return (
      <div class="login">
        <div class="login-form">
          <img src={new URL("/src/assets/zusam_logo.svg", import.meta.url)} />
          {!this.state.showResetPassword && (
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
              <div class="forgot-password">
                <span onClick={e => this.showPasswordReset(e)}>
                  {this.props.t("forgot_password")}
                </span>
              </div>
              <button
                type="submit"
                class="btn btn-light"
                onClick={e => this.sendLoginForm(e)}
                disabled={this.state.sending}
              >
                {this.props.t("connect")}
              </button>
            </form>
          )}
          {!!this.state.showResetPassword && (
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
              <button
                type="submit"
                class="btn btn-light"
                onClick={e => this.sendPasswordReset(e)}
                disabled={this.state.sending}
              >
                {this.props.t("submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation()(Login);
