import { h, Component } from "preact";
import { lang, router } from "/core";
import { FaIcon } from "/misc";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.search = this.search.bind(this);
  }

  search(evt) {
    evt.preventDefault();
    let group_id =
    router.route == "messages" ? router.entity?.group?.id : router.entity?.id;
    // https://stackoverflow.com/a/37511463
    let searchTerms = document
      .getElementById("search")
      .value.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(" ");
    router.navigate(
      `/groups/${group_id}?search=${searchTerms.map(e => encodeURIComponent(e)).join("+")}`
    );
  }

  render() {
    if (router.entity?.group?.id || router.entity?.id) {
      return (
        <form class="navbar-block search-block" onSubmit={e => this.search(e)}>
          <div class="input-group">
            <input
              class="form-control"
              type="text"
              id="search"
              placeholder={lang.t("search_in_group")}
              value={decodeURIComponent(
                router.getParam("search").replace(/\+/g, " ")
              )}
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
  }
}
