import http from "./http.js";
import lang from "./lang.js";
import cache from "./cache.js";

const me = {
    me: {},
    get: () => me.me.id ? Promise.resolve(me.me) : me.update(),
    update: () => cache.get("/api/me", true).then(r => {
        if (!r) {
            return;
        }
        me.me = Object.assign({notifications: []}, r);
        me.loadNotifications();
        lang.fetchDict();
        window.dispatchEvent(new CustomEvent("meStateChange"));
        return r;
    }),
    loadNotifications: () => cache.get("/api/users/" + me.me.id + "/notifications").then(r => {
        me.me.notifications = r;
        window.dispatchEvent(new CustomEvent("meStateChange"));
    }),
    matchNotification: (notif, id) => {
        if (notif.id === id) {
            return true;
        }
        if (notif.target === id) {
            return true;
        }
        if (
            notif.type === "new_comment"
            && notif.fromMessage.id === id
        ) {
            return true;
        }
        return false;
    },
    isNew: id => Array.isArray(me.me.notifications) ? me.me.notifications.some(n => me.matchNotification(n, id)) : false,
    removeMatchingNotifications: id => {
        return me.loadNotifications().then(_ => {
            if (!Array.isArray(me.me.notifications)) {
                return Promise.reject("Failed to get notifications from server");
            }
            return Promise.all(me.me.notifications.filter(n => me.matchNotification(n, id)).map(
                n => http.delete('/api/notifications/' + n.id).then(r => {
                    me.me.notifications = me.me.notifications.filter(e => !me.matchNotification(e, id));
                    window.dispatchEvent(new CustomEvent("meStateChange"));
                })
            ));
        });
    },
}
export default me;
