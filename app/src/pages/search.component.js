import { h } from "preact";
import { router } from "/src/core";
import { FaIcon } from "/src/misc";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Search() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  function search(evt) {
    evt.preventDefault();
    router.getEntity().then(entity => {
      let group_id = null;
      switch (entity.entityType) {
      case "group":
        group_id = entity.id;
        break;
      case "message":
        group_id = entity.group.id;
        break;
      default:
      }
      // https://stackoverflow.com/a/37511463
      let searchTerms = document
        .getElementById("search")
        .value.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(" ");
      navigate(`/groups/${group_id}/search?q=${searchTerms.join("+")}`);
      window.dispatchEvent(new CustomEvent("groupSearch"));
    });
  }

  return (
    <form class="navbar-block search-block" onSubmit={e => search(e)}>
      <div class="input-group">
        <input
          class="form-control"
          type="text"
          id="search"
          placeholder={t("search_in_group")}
          value={router.getParam("q").replace(/\+/g, " ")}
        />
        <div class="input-group-append">
          <button
            class="btn btn-secondary"
            type="submit"
          >
            <FaIcon family={"solid"} icon={"search"} />
          </button>
        </div>
      </div>
    </form>
  );
}
