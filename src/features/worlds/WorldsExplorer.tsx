import { useFocusEffect, useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ListsSection } from '@/features/lists/ListsSection';
import { FoldDebugPanel } from '@/features/worlds/components/fold-debug-panel';
import { ListDetailLayout } from '@/features/worlds/components/list-detail-layout';
import { WorldDetailPane } from '@/features/worlds/components/world-detail-pane';
import { WorldList } from '@/features/worlds/components/world-list';
import { WorldsNavigation } from '@/features/worlds/components/worlds-navigation';
import { useAdaptiveLayout } from '@/features/worlds/hooks/use-adaptive-layout';
import type { World } from '@/features/worlds/types';

export function WorldsExplorer() {
  const layout = useAdaptiveLayout();
  const { paneLayout, listColumns, listExtent, navigationMode } = layout;
  const [debugVisible, setDebugVisible] = useState(false);
  const [section, setSection] = useState<'worlds' | 'lists'>('worlds');
  const router = useRouter();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{ worldId?: string | string[] }>();
  const isListDetail = paneLayout === 'list-detail';
  const worldIdParam = Array.isArray(params.worldId) ? params.worldId[0] : params.worldId;
  const selectedWorldId = isListDetail ? worldIdParam : undefined;
  const previousPaneLayout = useRef(paneLayout);
  const wasFocused = useRef(isFocused);

  useEffect(() => {
    const previous = previousPaneLayout.current;
    previousPaneLayout.current = paneLayout;
    if (previous === 'list-detail' && paneLayout === 'single' && isFocused && worldIdParam) {
      router.push({ pathname: '/worlds/[worldId]', params: { worldId: worldIdParam } });
    }
  }, [paneLayout, isFocused, worldIdParam, router]);

  useEffect(() => {
    const gainedFocus = !wasFocused.current && isFocused;
    wasFocused.current = isFocused;
    if (gainedFocus && paneLayout === 'single' && worldIdParam) {
      router.setParams({ worldId: undefined });
    }
  }, [isFocused, paneLayout, worldIdParam, router]);

  useFocusEffect(
    useCallback(() => {
      if (!isListDetail || !worldIdParam) {
        return;
      }
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.setParams({ worldId: undefined });
        return true;
      });
      return () => subscription.remove();
    }, [isListDetail, worldIdParam, router]),
  );

  const handleSelectWorld = useCallback(
    (world: World) => {
      router.setParams({ worldId: world.worldId });
      if (!isListDetail) {
        router.push({ pathname: '/worlds/[worldId]', params: { worldId: world.worldId } });
      }
    },
    [isListDetail, router],
  );

  return (
    <View style={styles.root}>
      <WorldsNavigation
        navigationMode={navigationMode}
        section={section}
        onSelectSection={setSection}
        debugActive={debugVisible}
        onToggleDebug={() => setDebugVisible((current) => !current)}>
        {section === 'lists' ? (
          <ListsSection
            paneLayout={paneLayout}
            listExtent={listExtent}
            onBrowseWorlds={() => setSection('worlds')}
          />
        ) : (
          <ListDetailLayout
            enabled={isListDetail}
            list={
              <WorldList
                numColumns={listColumns}
                layoutKey={paneLayout}
                onSelectWorld={handleSelectWorld}
                selectedWorldId={selectedWorldId}
              />
            }
            detail={<WorldDetailPane worldId={selectedWorldId} />}
            listExtent={listExtent}
          />
        )}
      </WorldsNavigation>
      <FoldDebugPanel
        visible={debugVisible}
        onClose={() => setDebugVisible(false)}
        layout={layout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
