import lang from "./lang.js";

const util = {
    humanDate: timestamp => {
        if (!timestamp) {
            return null;
        }
        const duration = Math.round((Date.now()/1000 - timestamp)/60);
        if (duration < 60) {
            return lang.fr["there_is"] + " " + duration + "mn";
        }
        if (duration < 60 * 24) {
            return lang.fr["there_is"] + " " + Math.floor(duration/60) + "h";
        }
        let date = new Date(timestamp*1000);
        return ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    }
}
export default util;
