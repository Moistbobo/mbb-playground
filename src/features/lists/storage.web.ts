import type { ListsStorage } from './lib/lists-storage';

function webStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export const listsStorage: ListsStorage = {
  getItemSync: (key) => webStorage()?.getItem(key) ?? null,
  setItemSync: (key, value) => {
    webStorage()?.setItem(key, value);
  },
};
