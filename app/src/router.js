import http from "./http.js";
import store from "./store.js";
const router = {
    toApp: url => url.replace(/^\/api/,""),
    getSegments: () => window.location.pathname.slice(1).split("/"),
    navigate: (url, replace = false) => {
        const [family, id] = router.toApp(url).slice(1).split("/")
        switch (family) {
            case "messages":
            case "groups":
                if (replace) {
                    history.replaceState(null, "", url);
                } else {
                    history.pushState(null, "", url);
                }
                break;
            default:
                store.get("/api/me").then(user => {
                    const url = "/groups/" + http.getId(user.groups[0]);
                    if (replace) {
                        history.replaceState(null, "", url);
                    } else {
                        history.pushState(null, "", url);
                    }
                });
        }
        setTimeout(() => window.dispatchEvent(new Event("routerStateChange")), 1);
    },
    sync: () => {
        router.navigate(window.location.pathname, true);
    },
    onClick: e => {
        e.preventDefault();
        const t = e.target.closest("a")
        if (t) {
            if (e.ctrlKey) {
                window.open(t.getAttribute("href"),"_blank")
            } else {
                router.navigate(t.getAttribute("href"));
            }
        }
    },
};
export default router;
