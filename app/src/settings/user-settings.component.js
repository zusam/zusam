import { h } from "preact";
import { lang, router, alert, http, util, storage } from "/src/core";
import { useStoreon } from "storeon/preact";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export default function UserSettings() {

  const { t } = useTranslation();
  const { me } = useStoreon("me");
  const navigate = useNavigate();
  const location = useLocation();
  const [apiKey, setApiKey] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    storage.get("apiKey").then(apiKey => setApiKey(apiKey));
    setAlertMessage(t(router.getParam("alert")));
  }, []);

  const resetApiKey = (event) => {
    event.preventDefault();
    http.post(`/api/users/${me.id}/reset-api-key`, {}).then(() => router.logout());
  };

  const inputAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", event => {
      const formData = new FormData();
      formData.append("file", event.target.files[0]);
      http.sendFile(
        formData,
        file => {
          http.put(`/api/users/${me.id}`, { avatar: file["id"] }).then(() => {
            setAlertMessage(t("settings_updated"));
            navigate(`${location.pathname}?alert=settings_updated`);
          });
        }
      );
    });
    input.click();
  };

  const destroyAccount = (event) => {
    event.preventDefault();
    let confirmDeletion = confirm(t("are_you_sure"));
    if (confirmDeletion) {
      http.delete(`/api/users/${me.id}`).then(() => {
        navigate("/logout");
      });
    }
  };

  const updateSettings = (event) => {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']")
      .value;
    const login = document.querySelector("#settings_form input[name='email']")
      .value;
    const password = document.querySelector(
      "#settings_form input[name='password']"
    ).value;
    const notification_emails = document.querySelector(
      "#settings_form select[name='notification_emails']"
    ).value;
    const default_group = document.querySelector(
      "#settings_form select[name='default_group']"
    ).value;
    const lang = document.querySelector("#settings_form select[name='lang']")
      .value;
    let user = {};
    if (name) {
      user.name = name;
    }
    if (login) {
      user.login = login;
    }
    if (password) {
      user.password = password;
    }
    user["data"] = {
      notification_emails,
      default_group,
      lang
    };
    http.put(`/api/users/${me.id}`, user).then(res => {
      if (res["error"]) {
        alert.add(res["error"], "alert-danger");
      } else {
        setAlertMessage(t("settings_updated"));
        navigate(`${location.pathname}?alert=settings_updated`);
      }
    });
  };

  if (me && me?.data) {
    return (
      <div class="user-settings">
        <div class="card">
          <div class="identite card-body">
            <div class="container-fluid p-1">
              <div class="row">
                <div class="col-12 col-md-2">
                  <img
                    class="img-fluid rounded-circle material-shadow avatar"
                    src={
                      me.avatar
                        ? util.crop(me.avatar["id"], 100, 100)
                        : util.defaultAvatar
                    }
                    style={util.backgroundHash(me.id || "")}
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                    onClick={e => inputAvatar(e)}
                  />
                </div>
                <div class="col-12 col-md-10">
                  <form id="settings_form" class="mb-3">
                    <div class="form-group">
                      <label for="name">{t("name")}: </label>
                      <input
                        type="text"
                        name="name"
                        minlength="1"
                        maxlength="128"
                        placeholder={t("name_input")}
                        value={me.name}
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label for="email">{t("email")}: </label>
                      <input
                        type="email"
                        name="email"
                        placeholder={t("email_input")}
                        value={me.login}
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label for="password">{t("password")}: </label>
                      <input
                        type="password"
                        name="password"
                        autocomplete="off"
                        minlength="8"
                        maxlength="128"
                        placeholder={t("password_input")}
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label for="notification_emails">
                        {t("notification_emails")}:
                      </label>
                      <select
                        name="notification_emails"
                        class="form-control"
                        value={me?.data["notification_emails"]}
                      >
                        <option value="none">{t("none")}</option>
                        <option value="hourly">{t("hourly")}</option>
                        <option value="daily">{t("daily")}</option>
                        <option value="weekly">{t("weekly")}</option>
                        <option value="monthly">{t("monthly")}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="default_group">
                        {t("default_group")}:
                      </label>
                      <select
                        name="default_group"
                        class="form-control"
                        value={me?.data["default_group"]}
                      >
                        <option key="feed" value="feed_group">{`${t("feed_group")}`}</option>
                        {me.groups?.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="capitalize" for="lang">
                        {t("lang")}:
                      </label>
                      <select
                        name="lang"
                        class="form-control"
                        value={lang.getCurrentLang()}
                      >
                        {Object.keys(lang.possibleLang).map(k => (
                          <option key={k} value={k}>{lang.possibleLang[k]}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={e => updateSettings(e)}
                      class="btn btn-primary"
                    >
                      {t("save_changes")}
                    </button>
                  </form>
                  <form id="api_key_form">
                    <div class="form-group">
                      <label for="apiKey">
                        {t("api_key")}:{" "}
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        value={apiKey}
                        class="form-control font-size-80"
                        readonly="readonly"
                      />
                    </div>
                    <button
                      class="btn btn-outline-secondary"
                      onClick={resetApiKey}
                    >
                      {t("reset_api_key")}
                    </button>
                  </form>
                  <form id="destroy_form">
                    <label class="d-block" for="destroy_account">
                      {t("destroy_account_explain")}
                    </label>
                    <button
                      onClick={e => destroyAccount(e)}
                      name="destroy_account"
                      class="btn btn-danger"
                    >
                      {t("destroy_account")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {alertMessage && (
          <div class="global-alert alert alert-success">{alertMessage}</div>
        )}
      </div>
    );
  }
}
