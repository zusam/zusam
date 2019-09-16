import { h, render, Component } from "preact";
import { Suspense, lazy } from "preact/compat";
import { lang, me, router, http } from "/core";
import FaIcon from "./fa-icon.component.js";

const Writer = lazy(() => import("/message/writer.component.js"));

export default class Share extends Component {

    constructor() {
        super();
        let currentUrl = new URL(window.location);
        if (!currentUrl.searchParams.get('message')) {
            this.state = {
                loaded: true,
                group: null,
                title: currentUrl.searchParams.get('title') || "",
                text: currentUrl.searchParams.get('text') || "",
                url: currentUrl.searchParams.get('url') || "",
                files: null,
            };
        } else {
            http.get("/api/messages/" + currentUrl.searchParams.get('message')).then(m => {
                this.setState({
                    loaded: true,
                    group: null,
                    title: (m && m.data.title) || "",
                    text: (m && m.data.text) || "",
                    url: "",
                    files: (m && m.files) || null,
                });
            });
        }
        me.get().then(user => {
            if (user.groups.length == 1) {
                this.setState({group: user.groups[0]["id"]});
                router.backUrl = router.toApp(user.groups[0]).slice(4);
            }
        });
        this.groupSelect = this.groupSelect.bind(this);
    }

    groupSelect(e) {
        this.setState({group: e.target.value});
        router.backUrl = e.target.value.slice(4);
    }

    render() {
        if (!this.state["loaded"]) {
            return;
        }
        return (
            <article class="mt-2">
                <div class="container">
                    { me.me && me.me.groups.length > 1 && (
                        <div class="mb-1">
                            <label for="group_share_choice">{lang.t("group_share_choice")}</label>
                            <select
                                selectedIndex="-1"
                                class="form-control"
                                name="group_share_choice"
                                onChange={this.groupSelect}
                                required
                            >
                                { me.me.groups.map(e => <option value={e["id"]}>{e.name}</option>) }
                            </select>
                        </div>
                    )}
                    <Suspense fallback={<br/>}>
                        <Writer
                            focus={true}
                            group={this.state.group}
                            title={this.state.title}
                            text={this.state.text || this.state.url ? this.state.text + "\n" + this.state.url : ""}
                            files={this.state.files}
                        />
                    </Suspense>
                </div>
            </article>
        );
    }
}
