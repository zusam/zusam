import cache from "./cache.js";
import http from "./http.js";
import nlg from "./nlg.js";
import lang from "./lang.js";

const router = {
    route: "",
    id: "",
    action: "",
    url: "",
    backUrl: "",
    backUrlPrompt: "",
    entityUrl: "",
    entityType: "",
    entity: {},
    toApp: url => url.replace(/^\/api/,""),
    getParam: param => {
        let res = window.location.search.substring(1).split("&").find(e => e.split("=")[0] === param);
        return res ? res.split("=")[1] : "";
    },
    getSegments: () => window.location.pathname.slice(1).split("?")[0].split("/"),
    // check if route is "outside": accessible to non connected user
    isOutside: () => [
        "login",
        "password-reset",
        "signup",
        "invitation"
    ].includes(router.route || router.getSegments()[0]),
    navigate: (url, options = {}) => {
        const from = window.location.pathname;
        const queryParams = window.location.search;

        [router.route, router.id, router.action] = router.toApp(url).slice(1).split("?")[0].split("/");
        router.url = "";
        router.backUrl = "";
        router.entityUrl = "";
        router.backUrlPrompt = "";

        // set url, backUrl and entityUrl
		if (router.route && router.id) {
            router.url = "/" + router.route + "/" + router.id;
            router.entityUrl = "/api/" + router.route + "/" + router.id;
            router.entityType = router.route;
            if (router.action) {
                router.backUrl = "/";
                if(router.route == "users") {
                    router.backUrl = "/";
                }
                if (router.route == "groups" && router.action == "write") {
                    router.backUrl = router.entityUrl;
                    router.backUrlPrompt = lang.fr["cancel_write"];
                }
                router.url += "/" + router.action;
            }
        }

        nlg.hide(); // hide lightbox

        switch (router.route) {
            case "password-reset":
            case "signup":
            case "login":
                // we keep queryParams
                url = url + queryParams;
            case "messages":
            case "groups":
            case "users":
            case "create-group":
                if (options.replace) {
                    history.replaceState(null, "", url);
                } else {
                    history.pushState(null, "", url);
                }
                if (router.entityUrl) {
                    cache.get(router.entityUrl).then(res => {
                        router.entity = res;
                        if (router.entityType == "messages" && res["group"]) {
                            router.backUrl = router.toApp(res.group);
                        }
                        window.dispatchEvent(new CustomEvent("routerStateChange"));
                    });
                } else {
                    window.dispatchEvent(new CustomEvent("routerStateChange"));
                }
                break;
            case "logout":
                cache.reset();
                window.location.href = window.location.origin;
                break;
            case "invitation":
                cache.get("apiKey").then(apiKey => {
                    if (apiKey) {
                        http.post("/api/groups/invitation/" + router.id, {}).then(res => {
                            window.location.href = window.location.origin;
                        });
                    } else {
                        router.navigate("/signup?inviteKey=" + router.id);
                    }
                });
                break;
            default:
                cache.get("/api/me").then(user => {
                    if (!user) {
                        router.navigate("/login");
                        return;
                    }
                    if (user.groups[0]) {
                        router.navigate("/groups/" + user.groups[0].id);
                    } else {
                        window.location = "/create-group";
                    }
                });
        }
    },
    sync: () => router.navigate(window.location.pathname, {replace: true}),
    onClick: e => {
        e.preventDefault();
        const t = e.target.closest("a")
        if (t) {
            if (e.ctrlKey) {
                window.open(router.toApp(t.getAttribute("href")),"_blank")
            } else {
                router.navigate(router.toApp(t.getAttribute("href")));
            }
        }
    },
};
export default router;
