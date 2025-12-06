import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';
import frTranslation from '../locales/fr/translation.json';

// Define resources
const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  },
  fr: {
    translation: frTranslation
  }
};

// Get browser language or default to English
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages[0];
  const shortLang = browserLang.split('-')[0];
  
  // Check if we support this language
  if (resources[shortLang]) {
    return shortLang;
  }
  
  // Default to English
  return 'en';
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: {
      // Language detection options
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;