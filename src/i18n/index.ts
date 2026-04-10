//#region imports
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./ko.json";
import en from "./en.json";
//#endregion

//#region init
i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: "ko",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
//#endregion
