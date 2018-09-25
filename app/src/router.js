import bee from "./bee.js";
const router = {
    toApp: url => url.replace(/^\/api/,""),
    getParam: param => {
        let res = window.location.search.substring(1).split("&").find(e => e.split("=")[0] === param);
        return res ? res.split("=")[1] : "";
    },
    getSegments: () => window.location.pathname.slice(1).split("/"),
    navigate: (url, options = {}) => {
        const from = window.location.pathname;
        const queryParams = window.location.search;
        const [route, id, action] = router.toApp(url).slice(1).split("/")
        switch (route) {
            case "password-reset":
                // we keep queryParams for the password reset
                url = url + queryParams;
            case "login":
                bee.remove("apiKey");
            case "messages":
            case "groups":
            case "users":
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
            default:
                bee.get("/api/me").then(user => {
                    if (!user) {
                        router.navigate("/login");
                        return;
                    }
                    const url = "/groups/" + bee.getId(user.groups[0]);
                    if (options.replace) {
                        history.replaceState(null, "", url);
                    } else {
                        history.pushState(null, "", url);
                    }
                    setTimeout(() => window.dispatchEvent(new CustomEvent("routerStateChange", {detail : {
                        from: from,
                        data: options.data,
                    }})), 0);
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
