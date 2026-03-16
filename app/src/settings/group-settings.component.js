import { h } from "preact";
import { alert, http, util, router, api, me as meService } from "/src/core";
import { useStore } from "@nanostores/preact";
import { $me } from "/src/store/me.js";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { showConfirm } from "/src/store/confirm-modal.js";

export default function GroupSettings() {

  const params = useParams();
  const { t } = useTranslation();
  const me = useStore($me);
  const navigate = useNavigate();
  const [secretKey, setSecretKey] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [users, setUsers] = useState([]);
  const [group, setGroup] = useState({});
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    http.get(`/api/groups/${params.id}`).then(
      group => {
        if (!group) return;
        setGroup(group);
        setSecretKey(group.secretKey);
        setInviteKey(group.inviteKey);
        Promise.all(group.users.map(u => http.get(`/api/users/${u.id}`).catch(() => null).then(u => u))).then(
          users => setUsers(users.filter(u => u != null))
        );
      }
    ).catch(() => null);
    setAlertMessage(t(router.getParam("alert")));
  }, []);

  const resetInviteKey = async (event) => {
    event.preventDefault();
    if (await showConfirm({
      title: t("are_you_sure"),
      message: t("existing_invite_link_invalidated"),
      confirmText: t("reset_invitation_link"),
      cancelText: t("cancel"),
      variant: "primary"
    })) {
      http
        .post(`/api/groups/${group.id}/reset-invite-key`, {})
        .then(res => {
          if (!res) return;
          alert.add(t("group_updated"));
          setInviteKey(res["inviteKey"]);
        }).catch(() => null);
    }
  };

  const updateSettings = (event) => {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']").value;
    if (name) {
      group.name = name;
    }
    setGroup(Object.assign({}, group));
    http.put(`/api/groups/${group.id}`, group).then(res => {
      if (!res) return;
      setGroup(res);
      setAlertMessage(t("group_updated"));
      navigate(`${location.pathname}?alert=group_updated`);
    }).catch(() => null);
  };

  const leaveGroup = async (event) => {
    event.preventDefault();
    if (await showConfirm({
      title: t("are_you_sure"),
      message: t("you_will_need_invite"),
      confirmText: t("quit_group"),
      cancelText: t("cancel"),
      variant: "danger"
    })) {
      if (me.data?.default_group == group.id) {
        let user = {};
        user.data = { default_group: me.groups[0].id };
        http.put(`/api/users/${me.id}`, user).then(() => {
          meService.fetch();
          leave();
        }).catch(err => console.warn(err));
      } else {
        leave();
      }
    }
  };

  const leave = () => {
    http.post(`/api/groups/${group.id}/leave`, {}).then(res => {
      if (!res || !res["entityType"]) {
        alert.add(t("error"), "alert-danger");
      } else {
        meService.fetch();
        alert.add(t("group_left"));
        navigate("/");
      }
    }).catch(() => null);
  };

  return (
    <div>
      <div class="group-settings mb-3">
        <div class="card">
          <div class="card-body">
            <div class="container-fluid p-1">
              <div class="row">
                <div class="col-12 col-md-10">
                  <form id="settings_form" class="mb-1 border-bottom pb-1">
                    <div class="form-group">
                      <label for="name">{t("name")}: </label>
                      <input
                        type="text"
                        name="name"
                        minlength="1"
                        maxlength="128"
                        placeholder={t("name_input")}
                        value={group.name}
                        class="form-control"
                        required
                      />
                    </div>
                    <button
                      onClick={updateSettings}
                      class="btn btn-outline-secondary"
                    >
                      {t("save_changes")}
                    </button>
                  </form>
                  {api?.info?.show?.group_invitation_links && (
                    <form class="mb-1 border-bottom pb-1">
                      <div class="form-group">
                        <label for="inviteKey">
                          {t("invitation_link")}:{" "}
                        </label>
                        <input
                          type="text"
                          name="inviteKey"
                          value={
                            `${window.location.protocol}//${window.location.host}/invitation/${inviteKey}`
                          }
                          class="form-control font-size-80"
                          readonly="readonly"
                        />
                      </div>
                      <button
                        class="btn btn-outline-secondary"
                        onClick={resetInviteKey}
                      >
                        {t("reset_invitation_link")}
                      </button>
                    </form>
                  )}
                  <form>
                    <button
                      onClick={e => leaveGroup(e)}
                      class="btn btn-outline-danger"
                    >
                      {t("quit_group")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="user-list mb-3">
        <h3>{t("users")}</h3>
        {users.map(
          user =>
            user && (
              <div class="user-card" key={user.id}>
                <img
                  class="avatar material-shadow-with-hover"
                  style={util.backgroundHash(user.id)}
                  src={
                    user.avatar
                      ? util.crop(user.avatar["id"], 200, 200)
                      : util.defaultAvatar
                  }
                  onError={e => (e.currentTarget.src = util.defaultAvatar)}
                />
                <span>{user["name"]}</span>
              </div>
            )
        )}
      </div>
      {alertMessage && (
        <div class="global-alert alert alert-success">{alertMessage}</div>
      )}
    </div>
  );
}
