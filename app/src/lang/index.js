let _lang = null;

if (process.env.LANG == "fr") {
    _lang = require("./fr.js");
}

if (process.env.LANG == "en" || _lang == null) {
    _lang = require("./en.js");
}

export default _lang.default;
