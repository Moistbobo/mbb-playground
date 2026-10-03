/// <reference types="jest" />

import {
  DEFAULT_LISTS_PREFERENCES,
  LISTS_PREFERENCES_KEY,
  loadListsPreferences,
  saveListsPreferences,
} from '@/features/lists/lib/lists-preferences';
import type { ListsStorage } from '@/features/lists/lib/lists-storage';

function createStorage(initial: Record<string, string> = {}): ListsStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItemSync: (key) => values.get(key) ?? null,
    setItemSync: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('lists-preferences', () => {
  it('defaults to asking for confirmation', () => {
    expect(loadListsPreferences(createStorage())).toEqual(DEFAULT_LISTS_PREFERENCES);
  });

  it('round-trips a saved preference', () => {
    const storage = createStorage();
    saveListsPreferences(storage, { skipRemoveWorldConfirmation: true });
    expect(storage.getItemSync(LISTS_PREFERENCES_KEY)).toBe(
      JSON.stringify({ skipRemoveWorldConfirmation: true }),
    );
    expect(loadListsPreferences(storage)).toEqual({ skipRemoveWorldConfirmation: true });
  });

  it('falls back to defaults on malformed data', () => {
    expect(loadListsPreferences(createStorage({ [LISTS_PREFERENCES_KEY]: 'nope' }))).toEqual(
      DEFAULT_LISTS_PREFERENCES,
    );
  });
});
