/// <reference types="jest" />

import {
  persistLanguage,
  readSavedLanguageSync,
  type SyncStorage,
} from '@/i18n/language-preference';

function createStorage(initial: Record<string, string> = {}): SyncStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItemSync: (key) => values.get(key) ?? null,
    setItemSync: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('language-preference', () => {
  it('reads a stored language', () => {
    expect(readSavedLanguageSync(createStorage({ language: 'ja' }))).toBe('ja');
  });

  it('reports null when nothing is stored', () => {
    expect(readSavedLanguageSync(createStorage())).toBeNull();
  });

  it('writes the selected language', () => {
    const storage = createStorage();
    persistLanguage(storage, 'ja');
    expect(storage.getItemSync('language')).toBe('ja');
  });
});
