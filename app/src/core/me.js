import http from "./http.js";

const me = {
    me: {},
    update: () => http.get("/api/me", true).then(r => {
        me.me = r;
        window.dispatchEvent(new CustomEvent("updateMe"));
    }),
    removeNews: newsId => {
        me.me.news = me.me.news.filter(e => e != newsId);
        window.dispatchEvent(new CustomEvent("updateMe"));
    },
    isNews: newsId => me.me.news.includes(newsId),
}
export default me;
