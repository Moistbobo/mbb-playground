import type { ListsStorage } from './lists-storage';

export const LISTS_PREFERENCES_KEY = 'lists-preferences';

export interface ListsPreferences {
  skipRemoveWorldConfirmation: boolean;
}

export const DEFAULT_LISTS_PREFERENCES: ListsPreferences = {
  skipRemoveWorldConfirmation: false,
};

export function loadListsPreferences(storage: ListsStorage): ListsPreferences {
  try {
    const raw = storage.getItemSync(LISTS_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_LISTS_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_LISTS_PREFERENCES;
    }
    return {
      skipRemoveWorldConfirmation:
        (parsed as Partial<ListsPreferences>).skipRemoveWorldConfirmation === true,
    };
  } catch {
    return DEFAULT_LISTS_PREFERENCES;
  }
}

export function saveListsPreferences(storage: ListsStorage, prefs: ListsPreferences): void {
  storage.setItemSync(LISTS_PREFERENCES_KEY, JSON.stringify(prefs));
}
