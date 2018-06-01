import http from "./http.js";
const store = {
    currentUser: null,
    getCurrentUser: () => http.get("/api/me").then(user => { 
        store.currentUser = user;
        window.dispatchEvent(new Event("storeStateChange"));
    })
};
export default store;
