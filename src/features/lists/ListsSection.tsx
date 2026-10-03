import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { useLists } from '@/features/lists/ListsContext';
import { ListDetail } from '@/features/lists/components/list-detail';
import { ListsOverview } from '@/features/lists/components/lists-overview';
import { ListDetailLayout } from '@/features/worlds/components/list-detail-layout';
import { WorldDetailPane } from '@/features/worlds/components/world-detail-pane';
import type { PaneLayout } from '@/features/worlds/lib/window-size';

interface ListsSectionProps {
  paneLayout: PaneLayout;
  listExtent?: number;
  onBrowseWorlds?: () => void;
}

export function ListsSection({ paneLayout, listExtent, onBrowseWorlds }: ListsSectionProps) {
  const { getList } = useLists();
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
  const [selectedWorldId, setSelectedWorldId] = useState<string | undefined>(undefined);
  const isWide = paneLayout === 'list-detail';
  const activeListId = selectedListId && getList(selectedListId) ? selectedListId : undefined;

  const selectList = useCallback((listId: string) => {
    setSelectedListId(listId);
    setSelectedWorldId(undefined);
  }, []);

  const clearList = useCallback(() => {
    setSelectedListId(undefined);
    setSelectedWorldId(undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isWide || !activeListId) {
        return;
      }
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        clearList();
        return true;
      });
      return () => subscription.remove();
    }, [isWide, activeListId, clearList]),
  );

  if (!isWide && activeListId) {
    return (
      <ListDetail
        listId={activeListId}
        onBack={clearList}
        onDeleted={clearList}
        onBrowseWorlds={onBrowseWorlds}
      />
    );
  }

  return (
    <ListDetailLayout
      enabled={isWide}
      list={
        activeListId ? (
          <ListDetail
            listId={activeListId}
            onBack={clearList}
            onDeleted={clearList}
            onBrowseWorlds={onBrowseWorlds}
            onSelectWorld={setSelectedWorldId}
            selectedWorldId={selectedWorldId}
          />
        ) : (
          <ListsOverview onSelectList={selectList} compact={isWide} />
        )
      }
      detail={<WorldDetailPane worldId={selectedWorldId} />}
      listExtent={listExtent}
    />
  );
}

