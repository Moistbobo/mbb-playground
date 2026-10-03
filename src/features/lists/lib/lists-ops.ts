import type { AddWorldResult, CreateListInput, WorldList } from '../types';
import { createList } from './lists-storage';

function nowIso(): string {
  return new Date().toISOString();
}

export function addList(
  lists: WorldList[],
  input: CreateListInput,
): { lists: WorldList[]; list: WorldList } {
  const list = createList(input);
  return { lists: [...lists, list], list };
}

export function updateList(
  lists: WorldList[],
  id: string,
  input: Partial<CreateListInput>,
): { lists: WorldList[]; updated: WorldList | undefined } {
  let updated: WorldList | undefined;
  const next = lists.map((list) => {
    if (list.id !== id) {
      return list;
    }
    updated = {
      ...list,
      name: input.name?.trim() ?? list.name,
      icon: input.icon === undefined ? list.icon : input.icon?.trim() || null,
      color: input.color?.trim() ?? list.color,
      memo: input.memo === undefined ? list.memo ?? null : input.memo?.trim() || null,
      updatedAt: nowIso(),
    };
    return updated;
  });
  return { lists: next, updated };
}

export function deleteList(
  lists: WorldList[],
  id: string,
): { lists: WorldList[]; removed: boolean } {
  const next = lists.filter((list) => list.id !== id);
  return { lists: next, removed: next.length !== lists.length };
}

export function addWorld(
  lists: WorldList[],
  listId: string | undefined,
  worldId: string,
): { lists: WorldList[]; result: AddWorldResult } {
  if (!listId || !worldId.trim()) {
    return { lists, result: { ok: false, reason: 'missing' } };
  }
  const list = lists.find((entry) => entry.id === listId);
  if (!list) {
    return { lists, result: { ok: false, reason: 'not-found' } };
  }
  if (list.worldIds.includes(worldId)) {
    return { lists, result: { ok: false, reason: 'already-added' } };
  }
  const next = lists.map((entry) =>
    entry.id === listId
      ? { ...entry, worldIds: [...entry.worldIds, worldId], updatedAt: nowIso() }
      : entry,
  );
  return { lists: next, result: { ok: true } };
}

export function removeWorld(
  lists: WorldList[],
  listId: string | undefined,
  worldId: string,
): WorldList[] {
  if (!listId) {
    return lists;
  }
  return lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          worldIds: list.worldIds.filter((id) => id !== worldId),
          updatedAt: nowIso(),
        }
      : list,
  );
}

export function isWorldInList(lists: WorldList[], worldId: string, listId: string): boolean {
  return lists.some((list) => list.id === listId && list.worldIds.includes(worldId));
}

export function isWorldInAnyList(lists: WorldList[], worldId: string): boolean {
  return lists.some((list) => list.worldIds.includes(worldId));
}

export function getList(lists: WorldList[], id: string): WorldList | undefined {
  return lists.find((list) => list.id === id);
}

export function toggleWorld(
  lists: WorldList[],
  listId: string | undefined,
  worldId: string,
): WorldList[] {
  if (isWorldInList(lists, worldId, listId ?? '')) {
    return removeWorld(lists, listId, worldId);
  }
  return addWorld(lists, listId, worldId).lists;
}
