import me from "./me.js";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import api from "/src/core/api.js";

import cs_CZ from "/../translations/app/cs_CZ.json";
import de_DE from "/../translations/app/de_DE.json";
import en_US from "/../translations/app/en_US.json";
import es_ES from "/../translations/app/es_ES.json";
import fi_FI from "/../translations/app/fi_FI.json";
import fr_FR from "/../translations/app/fr_FR.json";
import hu_HU from "/../translations/app/hu_HU.json";
import it_IT from "/../translations/app/it_IT.json";
import ko_KR from "/../translations/app/ko_KR.json";
import nb_NO from "/../translations/app/nb_NO.json";
import nl_NL from "/../translations/app/nl_NL.json";
import pl_PL from "/../translations/app/pl_PL.json";
import pt_BR from "/../translations/app/pt_BR.json";
import ru_RU from "/../translations/app/ru_RU.json";
import sk_SK from "/../translations/app/sk_SK.json";
import ta_IN from "/../translations/app/ta_IN.json";
import zgh from "/../translations/app/zgh.json";
import zh_Hans from "/../translations/app/zh_Hans.json";

const lang = {
  possibleLang: {
    cs_CZ: "čeština",
    de_DE: "Deutsch",
    en_US: "English",
    es_ES: "español",
    fi_FI: "suomalainen",
    fr_FR: "français",
    hu_HU: "magyar nyelv",
    it_IT: "italiano",
    ko_KR: "한국어",
    nb_NO: "Norge",
    nl_NL: "Nederlands",
    pl_PL: "polski",
    pt_BR: "Português",
    ru_RU: "Русский",
    sk_SK: "Slovenský",
    ta_IN: "हिंदू",
    zgh: "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    zh_Hans: "中文",
  }, // possible dicts names to load
  getDefaultLang: () =>
    (api?.info?.default_lang || "en_US"),
  getCurrentLang: () => me.lang || lang.getDefaultLang(),
};

i18n.use(initReactI18next).init({
  resources: {
    cs_CZ: { translation: cs_CZ },
    de_DE: { translation: de_DE },
    en_US: { translation: en_US },
    es_ES: { translation: es_ES },
    fi_FI: { translation: fi_FI },
    fr_FR: { translation: fr_FR },
    hu_HU: { translation: hu_HU },
    it_IT: { translation: it_IT },
    ko_KR: { translation: ko_KR },
    nb_NO: { translation: nb_NO },
    nl_NL: { translation: nl_NL },
    pl_PL: { translation: pl_PL },
    pt_BR: { translation: pt_BR },
    ru_RU: { translation: ru_RU },
    sk_SK: { translation: sk_SK },
    ta_IN: { translation: ta_IN },
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
