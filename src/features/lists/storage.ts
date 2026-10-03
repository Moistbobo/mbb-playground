import Storage from 'expo-sqlite/kv-store';

import type { ListsStorage } from './lib/lists-storage';

export const listsStorage: ListsStorage = {
  getItemSync: (key) => Storage.getItemSync(key),
  setItemSync: (key, value) => Storage.setItemSync(key, value),
};
