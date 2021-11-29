import { h, Component } from "preact";
import { http } from "/src/core";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";
import { Navbar } from "/src/navbar";
import { Link } from "react-router-dom";
import { connectStoreon } from 'storeon/preact'
import { withTranslation } from 'react-i18next';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.type == "groups") {
      http.get(`/api/${this.props.type}/${this.props.id}`).then(
        res => {
          this.setState({entity: res});
        }
      );
    }
    if (this.props.type == "users") {
      // we use the /me endpoint to avoid service-workers cache
      http.get(`/api/me`).then(
        res => {
          this.setState({entity: res});
        }
      );
    }
  }

  render() {
    if (!this.state?.entity || !this.props?.me.id) {
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
                      class={`nav-link${this.state.entity["entityType"] == "user" ? " active" : ""}`}
                      to={`/users/${this.props.me.id}/settings`}
                    >
                      {this.props.t("account")}
                    </Link>
                  </li>
                  {this.props.me.groups?.length > 0 && (
                    <li
                      class="nav-item dropdown group-list"
                      tabindex="-1"
                      onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                      <div
                        class={`nav-link${this.state.entity["entityType"] == "group" ? " active" : ""}`}
                      >
                        {this.props.t("groups")}
                      </div>
                      <div class="dropdown-menu">
                        {this.props.me.groups?.map(e => (
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
                {this.state.entity["entityType"] === "user" && (
                  <UserSettings {...this.state.entity} />
                )}
                {this.state.entity["entityType"] === "group" && (
                  <GroupSettings {...this.state.entity} />
                )}
              </div>
            </div>
          </article>
        </div>
      </main>
    );
  }
}

export default withTranslation()(connectStoreon('me', Settings));
