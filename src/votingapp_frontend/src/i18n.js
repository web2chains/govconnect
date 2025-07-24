import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  id: {
    translation: {
      home: "Beranda",
      about: "Tentang Kami",
      news: "Berita",
      verify: "Verifikasi Identitas",
      voting: "Voting",
      login: "Login",
      dashboard: "Dasbor",
    },
  },
  en: {
    translation: {
      home: "Home",
      about: "About Us",
      news: "News",
      verify: "Identity Verification",
      voting: "Voting",
      login: "Login",
      dashboard: "Dashboard",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "id",
  fallbackLng: "id",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
