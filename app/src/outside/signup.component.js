import { h } from "preact";
import { alert, storage, http, router } from "/src/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const sendSignupForm = e => {
    e.preventDefault();
    let login = document.getElementById("login").value || "";
    login.toLowerCase();
    const password = document.getElementById("password").value;
    storage.set("apiKey", "");
    http
      .post("/api/signup", {
        login,
        password,
        invite_key: router.getParam("inviteKey")
      })
      .then(res => {
        if (res && !res.message) {
          storage.set("apiKey", res.api_key);
          setTimeout(() => navigate("/"), 100);
        } else {
          alert.add(t(res.message));
        }
      });
  };

  return (
    <div class="signup">
      <div class="signup-form">
        <img src={new URL("/src/assets/zusam_logo.svg", import.meta.url)} />
        <div class="welcome lead">{t("invitation_welcome")}</div>
        <form>
          <div class="form-group">
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
          <button
            type="submit"
            class="btn btn-light"
            onClick={e => sendSignupForm(e)}
          >
            {t("signup")}
          </button>
        </form>
      </div>
    </div>
  );
}
