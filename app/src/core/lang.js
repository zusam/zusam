import me from "./me.js";
import http from "./http.js";

const lang = {
    dict: [],
    possibleLang: {
        "en": "English",
        "es": "Español",
        "fr": "Français",
        "sk": "Slovenský",
    },
    getDefaultLang: () => Object.assign({}, document.querySelector("meta[name='zusam:default-lang']")).content || "en",
    getCurrentLang: () => me.me && me.me["data"] ? me.me.data["lang"] || lang.getDefaultLang() : lang.getDefaultLang(),
    fetchDict: (dict = lang.getCurrentLang()) => !lang.dict[dict] && http.get("/lang/" + dict + ".json").then(r => lang.dict[dict] = r),
    t: (id, param = null, dict = null) => {
        if (!dict) {
            dict = lang.getCurrentLang();
        }
        if (!id || !lang.dict[dict]) {
            return "";
        }
        return lang.dict[dict][id] ? lang.dict[dict][id].replace(/{}/, param) : console.warn("lang:", dict, id) && "";
    }
};
export default lang;
