import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Share } from 'react-native';

import type {
  AddWorldResult,
  CreateListInput,
  CreateListResult,
  ImportResult,
  WorldList,
} from '@/features/lists/types';
import {
  addList,
  addWorld,
  deleteList as deleteListOp,
  getList as getListOp,
  isWorldInAnyList as isWorldInAnyListOp,
  isWorldInList as isWorldInListOp,
  removeWorld,
  toggleWorld,
  updateList as updateListOp,
} from '@/features/lists/lib/lists-ops';
import { mergeListsById, serializeLists } from '@/features/lists/lib/lists-import-export';
import {
  loadListsPreferences,
  saveListsPreferences,
  type ListsPreferences,
} from '@/features/lists/lib/lists-preferences';
import { loadLists, saveLists } from '@/features/lists/lib/lists-storage';
import { listsStorage } from '@/features/lists/storage';

interface ListsContextValue {
  lists: WorldList[];
  error: string | null;
  isHydrated: boolean;
  skipRemoveWorldConfirmation: boolean;
  setSkipRemoveWorldConfirmation: (skip: boolean) => void;
  createList(input: CreateListInput): CreateListResult;
  updateList(id: string, input: Partial<CreateListInput>): WorldList | undefined;
  deleteList(id: string): boolean;
  addWorldToList(listId: string | undefined, worldId: string): AddWorldResult;
  removeWorldFromList(listId: string | undefined, worldId: string): void;
  toggleWorldInList(listId: string | undefined, worldId: string): void;
  isWorldInList(worldId: string, listId: string): boolean;
  isWorldInAnyList(worldId: string): boolean;
  getList(listId: string): WorldList | undefined;
  clearError(): void;
  exportList(list: WorldList): void;
  importLists(lists: WorldList[]): ImportResult;
}

const ListsContext = createContext<ListsContextValue | null>(null);

export function useLists(): ListsContextValue {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error('useLists must be used within ListsProvider');
  }
  return ctx;
}

interface ListsState {
  lists: WorldList[];
  error: string | null;
  preferences: ListsPreferences;
}

function readState(): ListsState {
  const { lists, error } = loadLists(listsStorage);
  return { lists, error, preferences: loadListsPreferences(listsStorage) };
}

export function ListsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ListsState>(readState);
  const listsRef = useRef(state.lists);

  useEffect(() => {
    listsRef.current = state.lists;
  }, [state.lists]);

  const commit = useCallback((next: WorldList[]) => {
    const { error } = saveLists(listsStorage, next);
    listsRef.current = next;
    setState((prev) => ({ ...prev, lists: next, error }));
  }, []);

  const createList = useCallback(
    (input: CreateListInput): CreateListResult => {
      const { lists, list } = addList(listsRef.current, input);
      commit(lists);
      return { ok: true, list };
    },
    [commit],
  );

  const updateList = useCallback(
    (id: string, input: Partial<CreateListInput>) => {
      const { lists, updated } = updateListOp(listsRef.current, id, input);
      commit(lists);
      return updated;
    },
    [commit],
  );

  const deleteList = useCallback(
    (id: string) => {
      const { lists, removed } = deleteListOp(listsRef.current, id);
      if (removed) {
        commit(lists);
      }
      return removed;
    },
    [commit],
  );

  const addWorldToList = useCallback(
    (listId: string | undefined, worldId: string): AddWorldResult => {
      const { lists, result } = addWorld(listsRef.current, listId, worldId);
      if (result.ok) {
        commit(lists);
      }
      return result;
    },
    [commit],
  );

  const removeWorldFromList = useCallback(
    (listId: string | undefined, worldId: string) => {
      commit(removeWorld(listsRef.current, listId, worldId));
    },
    [commit],
  );

  const toggleWorldInList = useCallback(
    (listId: string | undefined, worldId: string) => {
      const next = toggleWorld(listsRef.current, listId, worldId);
      if (next !== listsRef.current) {
        commit(next);
      }
    },
    [commit],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setSkipRemoveWorldConfirmation = useCallback((skip: boolean) => {
    const preferences = { skipRemoveWorldConfirmation: skip };
    saveListsPreferences(listsStorage, preferences);
    setState((prev) => ({ ...prev, preferences }));
  }, []);

  const exportList = useCallback((list: WorldList) => {
    void Share.share({ message: serializeLists([list]) });
  }, []);

  const importLists = useCallback(
    (incoming: WorldList[]): ImportResult => {
      commit(mergeListsById(listsRef.current, incoming));
      return { ok: true };
    },
    [commit],
  );

  const lists = state.lists;

  const isWorldInList = useCallback(
    (worldId: string, listId: string) => isWorldInListOp(lists, worldId, listId),
    [lists],
  );
  const isWorldInAnyList = useCallback(
    (worldId: string) => isWorldInAnyListOp(lists, worldId),
    [lists],
  );
  const getList = useCallback((listId: string) => getListOp(lists, listId), [lists]);

  const value = useMemo<ListsContextValue>(
    () => ({
      lists,
      error: state.error,
      isHydrated: true,
      skipRemoveWorldConfirmation: state.preferences.skipRemoveWorldConfirmation,
      setSkipRemoveWorldConfirmation,
      createList,
      updateList,
      deleteList,
      addWorldToList,
      removeWorldFromList,
      toggleWorldInList,
      isWorldInList,
      isWorldInAnyList,
      getList,
      clearError,
      exportList,
      importLists,
    }),
    [
      lists,
      state.error,
      state.preferences.skipRemoveWorldConfirmation,
      setSkipRemoveWorldConfirmation,
      createList,
      updateList,
      deleteList,
      addWorldToList,
      removeWorldFromList,
      toggleWorldInList,
      isWorldInList,
      isWorldInAnyList,
      getList,
      clearError,
      exportList,
      importLists,
    ],
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}
