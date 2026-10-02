import i18next, { changeLanguage } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { setLanguage } from './index';
import { getDeviceLanguage, isSupportedLanguage, type Language } from './language';
import { readSavedLanguageSync } from './language-preference';
import { syncStorage } from './storage';

export function useLanguage(): {
  language: Language;
  setLanguage: (lng: Language) => void;
} {
  const { i18n: instance } = useTranslation();
  const active = instance.resolvedLanguage ?? instance.language;
  return {
    language: isSupportedLanguage(active) ? active : 'en',
    setLanguage,
  };
}

export function useDeviceLocaleFallback(): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || readSavedLanguageSync(syncStorage) !== null) return;
      const deviceLanguage = getDeviceLanguage();
      if (deviceLanguage !== i18next.language) {
        changeLanguage(deviceLanguage);
      }
    });
    return () => subscription.remove();
  }, []);
}
