import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@kerala-athaan/i18n/en.json';
import mlTranslations from '@kerala-athaan/i18n/ml.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ml: { translation: mlTranslations },
    },
    lng: 'ml', // Default to Malayalam for Kerala audience
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
