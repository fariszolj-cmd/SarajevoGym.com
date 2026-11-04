import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import bs from '@/locales/bs.json';
import en from '@/locales/en.json';

const resources = {
  bs: { translation: bs },
  en: { translation: en },
};

const savedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('sarajevogym-language') : null;
const initialLanguage = savedLanguage === 'en' || savedLanguage === 'bs' ? savedLanguage : 'bs';

void i18next.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18next.on('languageChanged', (language) => {
  const resolvedLanguage = language.startsWith('bs') ? 'bs' : 'en';
  document.documentElement.lang = resolvedLanguage;
  window.localStorage.setItem('sarajevogym-language', resolvedLanguage);
});

export default i18next;
