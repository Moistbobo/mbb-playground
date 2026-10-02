/// <reference types="jest" />

import { createInstance } from 'i18next';

import en from '@/i18n/locales/en.json';
import ja from '@/i18n/locales/ja.json';

type LocaleResource = { [key: string]: string | LocaleResource };

function flatten(resource: LocaleResource, prefix = ''): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(resource)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') entries[path] = value;
    else Object.assign(entries, flatten(value, path));
  }
  return entries;
}

const enFlat = flatten(en);
const jaFlat = flatten(ja);

function placeholders(value: string): string[] {
  return value.match(/\{\{\s*\w+\s*\}\}/g) ?? [];
}

describe('locales', () => {
  it('defines every Japanese key in English', () => {
    for (const key of Object.keys(jaFlat)) {
      expect(Object.keys(enFlat)).toContain(key);
    }
  });

  it('keeps interpolation placeholders consistent across shared keys', () => {
    for (const [key, value] of Object.entries(jaFlat)) {
      if (enFlat[key] === undefined) continue;
      expect(placeholders(value).sort()).toEqual(placeholders(enFlat[key]).sort());
    }
  });

  it('falls back to English for a key missing from Japanese', async () => {
    const instance = createInstance();
    await instance.init({
      resources: {
        en: { translation: { home: { pressed: 'you have pressed {{name}}' } } },
        ja: { translation: {} },
      },
      lng: 'ja',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
    expect(instance.t('home.pressed', { name: 'X' })).toBe('you have pressed X');
  });

  it('interpolates the name into the active language template', async () => {
    const instance = createInstance();
    await instance.init({
      resources: { en: { translation: en }, ja: { translation: ja } },
      lng: 'ja',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
    expect(instance.t('home.pressed', { name: 'X' })).toBe('X を押しました');
  });
});
