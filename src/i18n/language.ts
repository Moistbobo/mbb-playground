import { getLocales } from 'expo-localization';

export const SUPPORTED_LANGUAGES = ['en', 'ja'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
};

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}

export function getDeviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isSupportedLanguage(code) ? code : 'en';
}

export function resolveLanguage(saved: string | null): Language {
  return isSupportedLanguage(saved) ? saved : getDeviceLanguage();
}
