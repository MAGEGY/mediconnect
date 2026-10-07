import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Import translation files
import en from "./en.json";
import ar from "./ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const getDeviceLanguage = () => {
  const locale = Localization.getLocales()[0];
  return locale.languageCode || "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
