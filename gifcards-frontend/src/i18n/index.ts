import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enAuth from "./locales/en/auth.json";
import esAuth from "./locales/es/auth.json";

const savedLanguage = localStorage.getItem("gifcards_language");

i18n.use(initReactI18next).init({
  resources: {
    en: { auth: enAuth },
    es: { auth: esAuth },
  },
  lng: savedLanguage ?? "en",
  fallbackLng: "en",
  defaultNS: "auth",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
