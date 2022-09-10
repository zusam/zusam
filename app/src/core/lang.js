import me from "./me.js";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "/src/lang/en.json";
import es from "/src/lang/es.json";
import fr from "/src/lang/fr.json";
import nl from "/src/lang/nl.json";
import sk from "/src/lang/sk.json";

const lang = {
  possibleLang: {
    en: "English",
    es: "Español",
    fr: "Français",
    nl: "Nederlands",
    sk: "Slovenský",
  }, // possible dicts names to load
  getDefaultLang: () =>
    (document.querySelector("meta[name='zusam:default-lang']") || {}).content ||
    "en",
  getCurrentLang: () => me.lang || lang.getDefaultLang(),
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    fr: {
      translation: fr
    },
    sk: {
      translation: sk
    },
    es: {
      translation: es
    },
    nl: {
      translation: nl
    },
  },
  lng: lang.getCurrentLang(), // if you're using a language detector, do not define the lng option
  fallbackLng: lang.getDefaultLang(),
  interpolation: {
    escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  }
});

export { lang, i18n };
