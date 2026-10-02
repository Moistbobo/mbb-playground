import { changeLanguage, use as registerI18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resolveLanguage, SUPPORTED_LANGUAGES, type Language } from './language';
import { persistLanguage, readSavedLanguageSync } from './language-preference';
import en from './locales/en.json';
import ja from './locales/ja.json';
import { syncStorage } from './storage';

registerI18n(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: resolveLanguage(readSavedLanguageSync(syncStorage)),
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: Language): void {
  persistLanguage(syncStorage, lng);
  changeLanguage(lng);
}
