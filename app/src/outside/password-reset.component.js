import { h } from "preact";
import { alert, storage, http, router } from "/src/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function PasswordReset() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const sendNewPassword = e => {
    e.preventDefault();
    storage.set("apiKey", "");
    const password = document.getElementById("password").value || "";
    const passwordConfirmation = document.getElementById("password_confirmation").value || "";
    const mail = router.getParam("mail");
    const key = router.getParam("key");
    if (mail && password) {
      if (password != passwordConfirmation) {
        alert.add(t("passwords_dont_match"));
        return;
      }
      http
        .post("/api/new-password", { mail, key, password })
        .then(res => {
          if (res.api_key) {
            storage.set("apiKey", res.api_key);
            setTimeout(() => navigate("/"), 100);
          } else {
            alert.add(t(res.message));
          }
        })
        .catch(res => console.warn(res));
    }
  };

  return (
    <div class="login">
      <div class="login-form">
        <h2 class="title">{t("reset_password_title")}</h2>
        <form>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              required
              id="password"
              placeholder={t("new_password_placeholder")}
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              required
              id="password_confirmation"
              placeholder={t("confirm_password_placeholder")}
            />
          </div>
          <button
            type="submit"
            class="btn btn-light"
            onClick={e => sendNewPassword(e)}
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
