import http from "./http.js";
import store from "./store.js";
const router = {
    getSegments: () => window.location.pathname.slice(1).split("/"),
    navigate: (url, replace = false) => {
        url = url.replace(/^\/api/,"");
        const [family, id] = url.slice(1).split("/")
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
                if (store.currentUser && store.currentUser.groups) {
                    const url = "/groups/" + http.getId(store.currentUser.groups[0]);
                    if (replace) {
                        history.replaceState(null, "", url);
                    } else {
                        history.pushState(null, "", url);
                    }
                }
        }
        window.dispatchEvent(new Event("routerStateChange"));
    },
    sync: () => router.navigate(window.location.pathname, true)
};
export default router;
