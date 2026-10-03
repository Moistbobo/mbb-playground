/// <reference types="jest" />

import {
  addList,
  addWorld,
  deleteList,
  getList,
  isWorldInAnyList,
  isWorldInList,
  removeWorld,
  toggleWorld,
  updateList,
} from '@/features/lists/lib/lists-ops';
import type { WorldList } from '@/features/lists/types';

const base: WorldList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: [],
  memo: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('lists-ops', () => {
  it('adds a list at the end', () => {
    const { lists, list } = addList([base], { name: 'Friends' });
    expect(list.name).toBe('Friends');
    expect(lists).toHaveLength(2);
    expect(lists[1]).toBe(list);
  });

  it('updates only the target list and ignores undefined fields', () => {
    const { lists, updated } = updateList([base], 'l1', { name: '  Renamed  ' });
    expect(updated?.name).toBe('Renamed');
    expect(updated?.color).toBe('#4f46e5');
    expect(lists[0]).toBe(updated);
  });

  it('clears icon and memo when explicitly set empty', () => {
    const withMeta: WorldList = { ...base, icon: 'Star', memo: 'note' };
    const { updated } = updateList([withMeta], 'l1', { icon: '', memo: '   ' });
    expect(updated?.icon).toBeNull();
    expect(updated?.memo).toBeNull();
  });

  it('deletes a list and reports whether it existed', () => {
    expect(deleteList([base], 'l1')).toEqual({ lists: [], removed: true });
    expect(deleteList([base], 'missing')).toEqual({ lists: [base], removed: false });
  });

  it('adds a world once and rejects duplicates, missing ids, and unknown lists', () => {
    const first = addWorld([base], 'l1', 'wrld_1');
    expect(first.result).toEqual({ ok: true });
    expect(first.lists[0].worldIds).toEqual(['wrld_1']);

    expect(addWorld(first.lists, 'l1', 'wrld_1').result).toEqual({
      ok: false,
      reason: 'already-added',
    });
    expect(addWorld([base], 'l1', '  ').result).toEqual({ ok: false, reason: 'missing' });
    expect(addWorld([base], undefined, 'wrld_1').result).toEqual({
      ok: false,
      reason: 'missing',
    });
    expect(addWorld([base], 'nope', 'wrld_1').result).toEqual({
      ok: false,
      reason: 'not-found',
    });
  });

  it('removes a world and tolerates a missing list id', () => {
    const withWorld: WorldList = { ...base, worldIds: ['wrld_1'] };
    expect(removeWorld([withWorld], 'l1', 'wrld_1')[0].worldIds).toEqual([]);
    expect(removeWorld([withWorld], undefined, 'wrld_1')).toEqual([withWorld]);
  });

  it('answers membership queries', () => {
    const withWorld: WorldList = { ...base, worldIds: ['wrld_1'] };
    expect(isWorldInList([withWorld], 'wrld_1', 'l1')).toBe(true);
    expect(isWorldInList([withWorld], 'wrld_1', 'nope')).toBe(false);
    expect(isWorldInAnyList([withWorld], 'wrld_1')).toBe(true);
    expect(isWorldInAnyList([withWorld], 'wrld_9')).toBe(false);
    expect(getList([base], 'l1')).toBe(base);
    expect(getList([base], 'nope')).toBeUndefined();
  });

  it('toggles world membership', () => {
    const added = toggleWorld([base], 'l1', 'wrld_1');
    expect(added[0].worldIds).toEqual(['wrld_1']);
    const removed = toggleWorld(added, 'l1', 'wrld_1');
    expect(removed[0].worldIds).toEqual([]);
  });
});
