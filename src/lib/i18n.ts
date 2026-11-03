import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import bs from '@/locales/bs.json';
import en from '@/locales/en.json';

const resources = {
  bs: { translation: bs },
  en: { translation: en },
};

void i18next.use(initReactI18next).init({
  resources,
  lng: 'bs',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
