/// <reference types="jest" />

import { getLocales } from 'expo-localization';

import { getDeviceLanguage, isSupportedLanguage, resolveLanguage } from '@/i18n/language';

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));

const getLocalesMock = getLocales as jest.MockedFunction<typeof getLocales>;

function setDeviceLocale(languageCode: string | null): void {
  getLocalesMock.mockReturnValue([{ languageCode } as ReturnType<typeof getLocales>[number]]);
}

describe('language', () => {
  beforeEach(() => {
    getLocalesMock.mockReset();
    setDeviceLocale('en');
  });

  it('accepts only supported language codes', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('ja')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });

  it('reads the device language when it is supported', () => {
    setDeviceLocale('ja');
    expect(getDeviceLanguage()).toBe('ja');
  });

  it('falls back to English for an unsupported device language', () => {
    setDeviceLocale('fr');
    expect(getDeviceLanguage()).toBe('en');
  });

  it('prefers a supported saved language over the device language', () => {
    setDeviceLocale('en');
    expect(resolveLanguage('ja')).toBe('ja');
  });

  it('falls back to the device language when the saved value is unsupported', () => {
    setDeviceLocale('ja');
    expect(resolveLanguage('fr')).toBe('ja');
    expect(resolveLanguage(null)).toBe('ja');
  });
});
