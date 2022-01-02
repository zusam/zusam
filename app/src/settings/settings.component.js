import { h } from "preact";
import { http } from "/src/core";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";
import { Navbar } from "/src/navbar";
import { Link, useParams } from "react-router-dom";
import { useStoreon } from "storeon/preact";
import { useEffect, useState } from "preact/hooks";
import { useTranslation } from "react-i18next";

export default function Settings(props) {

  const params = useParams();
  const { t } = useTranslation();
  const { me } = useStoreon('me');
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    if (params.type == "groups") {
      http.get(`/api/${params.type}/${params.id}`).then(
        res => {
          setEntity(res);
        }
      );
    }
    if (params.type == "users") {
      // we use the /me endpoint to avoid service-workers cache
      http.get(`/api/me`).then(
        res => {
          setEntity(res);
        }
      );
    }
  }, []);

  if (!entity || !me.id) {
    return;
  }
  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mt-2 justify-content-center d-flex">
          <div class="container pb-3">
            <div class="settings">
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <Link
                    class={`nav-link${entity["entityType"] == "user" ? " active" : ""}`}
                    to={`/users/${me.id}/settings`}
                  >
                    {t("account")}
                  </Link>
                </li>
                {me.groups?.length > 0 && (
                  <li
                    class="nav-item dropdown group-list"
                    tabindex="-1"
                    onClick={e => e.currentTarget.classList.toggle("active")}
                  >
                    <div
                      class={`nav-link${entity["entityType"] == "group" ? " active" : ""}`}
                    >
                      {t("groups")}
                    </div>
                    <div class="dropdown-menu">
                      {me.groups?.map(e => (
                        <Link
                          key={`/groups/${e.id}/settings`}
                          class="seamless-link"
                          to={`/groups/${e.id}/settings`}
                        >
                          {e.name}
                        </Link>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
              {entity["entityType"] === "user" && (
                <UserSettings {...entity} />
              )}
              {entity["entityType"] === "group" && (
                <GroupSettings group={entity} />
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
