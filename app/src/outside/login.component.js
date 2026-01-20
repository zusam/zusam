import { h } from "preact";
import { alert, storage, http, me, api } from "/src/core";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [sending, setSending] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [allowEmails, setAllowEmails] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // reroute if already logged in
    storage.get("apiKey").then(apiKey => apiKey && navigate("/"));
    storage.reset();

    api.update().then(info => {
      setAllowEmails(info.allow_email);
    });
  }, []);

  const sendPasswordReset = e => {
    e.preventDefault();
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    setSending(true);
    http.post("/api/password-reset-mail", { mail: login }).then(res => {
      setSending(false);
      if (res && !res.message) {
        alert.add(t("password_reset_mail_sent"));
      } else {
        alert.add(t(res.message), "alert-danger");
      }
    });
  };

  const sendLoginForm = e => {
    e.preventDefault();
    setSending(true);
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    const password = document.getElementById("password").value;
    http.post("/api/login", {login, password}).then(res => {
      setSending(false);
      if (res && res.api_key) {
        storage.set("apiKey", res.api_key).then(() => {
          me.update().then(user => {
            let redirect = "/create-group";
            if (user?.groups[0]) {
              redirect = "/feed";
            }
            navigate(redirect);
          });
        });
      } else if (res && res.message) {
        alert.add(t(res.message), "alert-danger");
      } else {
        alert.add(t("error"), "alert-danger");
      }
    });
  };

  return (
    <div class="login">
      <div class="login-form">
        <img src={new URL("/src/assets/zusam_logo.svg", import.meta.url)} />
        {!showResetPassword && (
          <form>
            <div class="form-group mb-3">
              <input
                type="email"
                class="form-control"
                required
                id="login"
                placeholder={t("login_placeholder")}
              />
            </div>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                required
                id="password"
                placeholder={t("password_placeholder")}
              />
            </div>
            <div class="forgot-password">
              <span onClick={() => setShowResetPassword(true)}>
                {t("forgot_password")}
              </span>
            </div>
            <button
              type="submit"
              class="btn btn-light"
              onClick={e => sendLoginForm(e)}
              disabled={sending}
            >
              {t("connect")}
            </button>
          </form>
        )}
        {!!showResetPassword && (
          <div>
            {allowEmails ? (
              <form>
                <div class="form-group mb-3">
                  <input
                    type="email"
                    class="form-control"
                    required
                    id="login"
                    placeholder={t("login_placeholder")}
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-light"
                  onClick={e => sendPasswordReset(e)}
                  disabled={sending}
                >
                  {t("submit")}
                </button>
              </form>
            ) : (
              <div class="welcome">{t("email_disabled")}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}