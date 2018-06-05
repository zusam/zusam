import bee from "./bee.js";
const router = {
    toApp: url => url.replace(/^\/api/,""),
    getSegments: () => window.location.pathname.slice(1).split("/"),
    navigate: (url, replace = false) => {
        const [family, id] = router.toApp(url).slice(1).split("/")
        switch (family) {
            case "messages":
            case "groups":
            case "login":
                if (replace) {
                    history.replaceState(null, "", url);
                } else {
                    history.pushState(null, "", url);
                }
				setTimeout(() => window.dispatchEvent(new Event("routerStateChange")), 1);
                break;
            case "logout":
                bee.resetData();
                history.pushState(null, "", url);
            default:
                bee.get("/api/me").then(user => {
                    const url = "/groups/" + bee.getId(user.groups[0]);
                    if (replace) {
                        history.replaceState(null, "", url);
                    } else {
                        history.pushState(null, "", url);
                    }
					setTimeout(() => window.dispatchEvent(new Event("routerStateChange")), 1);
                });
        }
    },
    sync: () => {
        router.navigate(window.location.pathname, true);
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
