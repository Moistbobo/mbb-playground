export type SyncStorage = {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
};

const LANGUAGE_KEY = 'language';

export function readSavedLanguageSync(storage: SyncStorage): string | null {
  return storage.getItemSync(LANGUAGE_KEY);
}

export function persistLanguage(storage: SyncStorage, lng: string): void {
  storage.setItemSync(LANGUAGE_KEY, lng);
}
