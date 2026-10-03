import type { CreateListInput, WorldList } from '../types';
import { DEFAULT_LIST_COLOR } from './list-colors';

export const LISTS_STORAGE_KEY = 'lists';
export const LISTS_SCHEMA_VERSION = 1;

export interface ListsSnapshot {
  version: number;
  lists: WorldList[];
}

export interface ListsStorage {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
}

export function generateListId(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `list_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createList(input: CreateListInput): WorldList {
  const now = new Date().toISOString();
  return {
    id: generateListId(),
    name: input.name.trim(),
    icon: input.icon?.trim() || null,
    color: input.color?.trim() || DEFAULT_LIST_COLOR,
    memo: input.memo?.trim() || null,
    worldIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateLists(raw: unknown): WorldList[] {
  if (Array.isArray(raw)) {
    return raw as WorldList[];
  }
  if (
    raw &&
    typeof raw === 'object' &&
    'lists' in raw &&
    Array.isArray((raw as ListsSnapshot).lists)
  ) {
    return (raw as ListsSnapshot).lists;
  }
  return [];
}

export function loadLists(storage: ListsStorage): { lists: WorldList[]; error: string | null } {
  try {
    const raw = storage.getItemSync(LISTS_STORAGE_KEY);
    if (!raw) {
      return { lists: [], error: null };
    }
    return { lists: migrateLists(JSON.parse(raw) as unknown), error: null };
  } catch (err) {
    return {
      lists: [],
      error: err instanceof Error ? `Failed to read lists: ${err.message}` : 'Failed to read lists',
    };
  }
}

export function saveLists(storage: ListsStorage, lists: WorldList[]): { error: string | null } {
  try {
    const snapshot: ListsSnapshot = { version: LISTS_SCHEMA_VERSION, lists };
    storage.setItemSync(LISTS_STORAGE_KEY, JSON.stringify(snapshot));
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to save lists',
    };
  }
}
