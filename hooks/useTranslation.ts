import { useTranslation } from "react-i18next";
import * as Localization from "expo-localization";

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === "ar";

  const deviceLanguage = Localization.getLocales()[0].languageCode || "en";

  return {
    t,
    changeLanguage,
    currentLanguage,
    isRTL,
    deviceLanguage,
    availableLanguages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "ar", name: "Arabic", nativeName: "العربية" },
    ],
  };
};
