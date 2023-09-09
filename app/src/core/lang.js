import me from "./me.js";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import cs_CZ from "/src/lang/cs_CZ.json";
import de_DE from "/src/lang/de_DE.json";
import en_US from "/src/lang/en_US.json";
import es_ES from "/src/lang/es_ES.json";
import fr_FR from "/src/lang/fr_FR.json";
import hu_HU from "/src/lang/hu_HU.json";
import ko_KR from "/src/lang/ko_KR.json";
import nl_NL from "/src/lang/nl_NL.json";
import sk_SK from "/src/lang/sk_SK.json";
import zgh from "/src/lang/zgh.json";
import zh_Hans from "/src/lang/zh_Hans.json";

const lang = {
  possibleLang: {
    "cs_CZ": "čeština",
    "de_DE": "Deutsch",
    "en_US": "english",
    "es_ES": "español",
    "fr_FR": "français",
    "hu_HU": "magyar nyelv",
    "ko_KR": "한국어",
    "nl_NL": "Nederlands",
    "sk_SK": "Slovenský",
    "zgh": "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    "zh_Hans": "中文",
  }, // possible dicts names to load
  getDefaultLang: () =>
    (document.querySelector("meta[name='zusam:default-lang']") || {}).content ||
    "en_US",
  getCurrentLang: () => me.lang || lang.getDefaultLang(),
};

i18n.use(initReactI18next).init({
  resources: {
    cs_CZ: { translation: cs_CZ },
    de_DE: { translation: de_DE },
    en: { translation: en_US }, // backwards compatibility, remove for 0.6
    en_US: { translation: en_US },
    es_ES: { translation: es_ES },
    es: { translation: es_ES }, // backwards compatibility, remove for 0.6
    fr_FR: { translation: fr_FR },
    fr: { translation: fr_FR }, // backwards compatibility, remove for 0.6
    hu_HU: { translation: hu_HU },
    ko_KR: { translation: ko_KR },
    nl_NL: { translation: nl_NL },
    nl: { translation: nl_NL }, // backwards compatibility, remove for 0.6
    sk_SK: { translation: sk_SK },
    sk: { translation: sk_SK }, // backwards compatibility, remove for 0.6
    zgh: { translation: zgh },
    zh_Hans: { translation: zh_Hans },
  },
  lng: lang.getCurrentLang(), // if you're using a language detector, do not define the lng option
  fallbackLng: lang.getDefaultLang(),
  interpolation: {
    escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  }
});

export { lang, i18n };
