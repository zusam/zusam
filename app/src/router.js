import bee from "./bee.js";
import nlg from "./nlg.js";
const router = {
    toApp: url => url.replace(/^\/api/,""),
    getParam: param => {
        let res = window.location.search.substring(1).split("&").find(e => e.split("=")[0] === param);
        return res ? res.split("=")[1] : "";
    },
    getSegments: () => window.location.pathname.slice(1).split("?")[0].split("/"),
    navigate: (url, options = {}) => {
        const from = window.location.pathname;
        const queryParams = window.location.search;
        const [route, id, action] = router.toApp(url).slice(1).split("?")[0].split("/");
        nlg.hide(); // hide lightbox
        switch (route) {
            case "password-reset":
            case "signup":
            case "login":
                // we keep queryParams
                url = url + queryParams;
                bee.remove("apiKey");
            case "messages":
            case "groups":
            case "users":
            case "create-group":
                if (options.replace) {
                    history.replaceState(null, "", url);
                } else {
                    history.pushState(null, "", url);
                }
                setTimeout(() => window.dispatchEvent(new CustomEvent("routerStateChange", {detail : {
                    from: from,
                    data: options.data,
                }})), 0);
                break;
            case "logout":
                bee.resetData();
                window.location.href = window.location.origin;
                break;
            case "invitation":
                bee.get("apiKey").then(apiKey => {
                    if (apiKey) {
                        bee.http.post("/api/groups/invitation/" + id, {}).then(res => {
                            window.location.href = window.location.origin;
                        });
                    } else {
                        router.navigate("/signup?inviteKey=" + id);
                    }
                });
                break;
            default:
                bee.get("/api/me").then(user => {
                    if (!user) {
                        router.navigate("/login");
                        return;
                    }
                    console.log(user.groups[0]);
                    if (user.groups[0]) {
                        router.navigate("/groups/" + bee.getId(user.groups[0]));
                    } else {
                        window.location = "/create-group";
                    }
                });
        }
    },
    sync: () => {
        router.navigate(window.location.pathname, {replace: true});
    },
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
