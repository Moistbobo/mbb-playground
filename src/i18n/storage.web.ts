import type { SyncStorage } from './language-preference';

function webStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export const syncStorage: SyncStorage = {
  getItemSync: (key) => webStorage()?.getItem(key) ?? null,
  setItemSync: (key, value) => {
    webStorage()?.setItem(key, value);
  },
};
