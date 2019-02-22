import http from "./http.js";

const me = {
    me: {},
    update: () => http.get("/api/me", true).then(r => {
            me.me = r;
            window.dispatchEvent(new CustomEvent("meStateChange"));
    }),
    removeNews: newsId => {
        if (me.me.news) {
            me.me.news = me.me.news.filter(e => e != newsId);
            window.dispatchEvent(new CustomEvent("meStateChange"));
        }
    },
    isNews: newsId => me.me.news ? me.me.news.includes(newsId) : false,
}
export default me;
