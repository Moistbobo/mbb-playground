/// <reference types="jest" />

import {
  LISTS_STORAGE_KEY,
  createList,
  loadLists,
  migrateLists,
  saveLists,
  type ListsStorage,
} from '@/features/lists/lib/lists-storage';
import type { WorldList } from '@/features/lists/types';

function createStorage(initial: Record<string, string> = {}): ListsStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItemSync: (key) => values.get(key) ?? null,
    setItemSync: (key, value) => {
      values.set(key, value);
    },
  };
}

const sampleList: WorldList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: ['wrld_1'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('createList', () => {
  it('trims the name, applies defaults, and starts empty', () => {
    const list = createList({ name: '  Favorites  ' });
    expect(list.name).toBe('Favorites');
    expect(list.icon).toBeNull();
    expect(list.color).toBe('#4f46e5');
    expect(list.memo).toBeNull();
    expect(list.worldIds).toEqual([]);
    expect(list.id).toEqual(expect.any(String));
  });

  it('honours a supplied icon, color, and memo', () => {
    const list = createList({ name: 'X', icon: ' Moon ', color: '#000000', memo: ' hi ' });
    expect(list.icon).toBe('Moon');
    expect(list.color).toBe('#000000');
    expect(list.memo).toBe('hi');
  });
});

describe('migrateLists', () => {
  it('accepts a raw array and a versioned snapshot', () => {
    expect(migrateLists([sampleList])).toEqual([sampleList]);
    expect(migrateLists({ version: 1, lists: [sampleList] })).toEqual([sampleList]);
  });

  it('returns empty for unrecognized shapes', () => {
    expect(migrateLists(null)).toEqual([]);
    expect(migrateLists({ version: 1 })).toEqual([]);
    expect(migrateLists('nope')).toEqual([]);
  });
});

describe('loadLists', () => {
  it('returns empty when nothing is stored', () => {
    expect(loadLists(createStorage())).toEqual({ lists: [], error: null });
  });

  it('reads a stored snapshot', () => {
    const storage = createStorage({
      [LISTS_STORAGE_KEY]: JSON.stringify({ version: 1, lists: [sampleList] }),
    });
    expect(loadLists(storage)).toEqual({ lists: [sampleList], error: null });
  });

  it('reports an error on malformed JSON instead of throwing', () => {
    const storage = createStorage({ [LISTS_STORAGE_KEY]: '{not json' });
    const result = loadLists(storage);
    expect(result.lists).toEqual([]);
    expect(result.error).toContain('Failed to read lists');
  });
});

describe('saveLists', () => {
  it('writes a versioned snapshot', () => {
    const storage = createStorage();
    expect(saveLists(storage, [sampleList])).toEqual({ error: null });
    expect(JSON.parse(storage.getItemSync(LISTS_STORAGE_KEY) as string)).toEqual({
      version: 1,
      lists: [sampleList],
    });
  });
});
