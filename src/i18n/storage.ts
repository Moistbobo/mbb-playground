import Storage from 'expo-sqlite/kv-store';

import type { SyncStorage } from './language-preference';

export const syncStorage: SyncStorage = {
  getItemSync: (key) => Storage.getItemSync(key),
  setItemSync: (key, value) => Storage.setItemSync(key, value),
};
