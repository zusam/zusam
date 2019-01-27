import http from "./http.js";

const me = {
    me: {},
    update: () => http.get("/api/me", true).then(r => me.me = r),
    removeNews: newsId => me.me.news = me.me.news.filter(e => e != newsId),
    isNews: newsId => me.me.news.includes(newsId),
}
export default me;
