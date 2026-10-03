import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Spacing } from '@/constants/theme';
import { useLists } from '@/features/lists/ListsContext';
import { SaveToListDialog } from '@/features/lists/components/save-to-list-dialog';
import { ResultsHeader } from '@/features/worlds/components/results-header';
import { WorldCard } from '@/features/worlds/components/world-card';
import { useInfiniteWorlds } from '@/features/worlds/hooks/use-worlds';
import { CARD_MARGIN_H, LIST_CONTENT_PADDING_H } from '@/features/worlds/lib/list-layout';
import type { World } from '@/features/worlds/types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface WorldListProps {
  numColumns: number;
  layoutKey: string;
  onSelectWorld: (world: World) => void;
  selectedWorldId?: string;
}

export function WorldList({ numColumns, layoutKey, onSelectWorld, selectedWorldId }: WorldListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isWorldInAnyList } = useLists();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [saveWorldId, setSaveWorldId] = useState<string | null>(null);
  const listRef = useRef<FlashListRef<World>>(null);
  const flashListKey = `${numColumns}:${layoutKey}`;
  const loadedKeyRef = useRef<string | null>(null);
  const scrolledKeyRef = useRef<string | null>(null);
  const lastOffsetRef = useRef(0);
  const lastFirstItemRef = useRef(0);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset: 0,
      minCapacity: 1,
      maxCapacity: 80,
      search: search || undefined,
      order,
    }),
    [search, order],
  );

  const query = useInfiniteWorlds(params);
  const worlds = useMemo(() => query.data?.pages.flatMap((page) => page.worlds) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;

  const scrollToSelected = useCallback(() => {
    if (loadedKeyRef.current !== flashListKey || !selectedWorldId) {
      return;
    }
    const scrollKey = `${flashListKey}:${selectedWorldId}`;
    if (scrolledKeyRef.current === scrollKey) {
      return;
    }
    const index = worlds.findIndex((world) => world.worldId === selectedWorldId);
    const list = listRef.current;
    if (index < 0 || !list) {
      return;
    }
    scrolledKeyRef.current = scrollKey;
    list
      .scrollToIndex({ index, viewPosition: 0.5, animated: false })
      .then(() => {
        lastOffsetRef.current = listRef.current?.getAbsoluteLastScrollOffset() ?? lastOffsetRef.current;
        lastFirstItemRef.current = listRef.current?.getFirstItemOffset() ?? 0;
      })
      .catch(() => undefined);
  }, [flashListKey, selectedWorldId, worlds]);

  const restoreOffset = useCallback((raw: number, previousFirstItem: number) => {
    let attempts = 0;
    const tick = () => {
      const list = listRef.current;
      if (!list || userScrolledRef.current) {
        return;
      }
      const firstItem = list.getFirstItemOffset();
      const target = raw <= previousFirstItem ? raw : raw - previousFirstItem + firstItem;
      list.scrollToOffset({ offset: target, animated: false });
      attempts += 1;
      const actual = list.getAbsoluteLastScrollOffset();
      if (attempts < 8 && Math.abs((actual ?? -1) - target) > 4) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    scrollToSelected();
  }, [scrollToSelected]);

  const handleEndReached = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  const handleToggleOrder = useCallback(() => {
    setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  }, []);

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.intro}>
        <Text style={styles.title}>{t('worlds.title')}</Text>
        <Text style={styles.subtitle}>{t('worlds.subtitle')}</Text>
      </View>
      <ResultsHeader
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        total={total}
        isPending={query.isPending}
        isError={query.isError}
        errorMessage={query.error instanceof Error ? query.error.message : null}
        onRetry={() => {
          void query.refetch();
        }}
        order={order}
        onToggleOrder={handleToggleOrder}
        numColumns={numColumns}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlashList
        key={`worlds-${flashListKey}`}
        ref={listRef}
        data={worlds}
        onLoad={() => {
          loadedKeyRef.current = flashListKey;
          scrolledKeyRef.current = null;
          userScrolledRef.current = false;
          if (selectedWorldId) {
            scrollToSelected();
          } else {
            restoreOffset(lastOffsetRef.current, lastFirstItemRef.current);
          }
        }}
        onScrollBeginDrag={() => {
          userScrolledRef.current = true;
        }}
        onScroll={(event) => {
          if (userScrolledRef.current) {
            lastOffsetRef.current = event.nativeEvent.contentOffset.y;
            lastFirstItemRef.current = listRef.current?.getFirstItemOffset() ?? 0;
          }
        }}
        scrollEventThrottle={100}
        numColumns={numColumns}
        renderItem={({ item }: { item: World }) => (
          <View style={styles.cell}>
            <WorldCard
              world={item}
              onSelect={onSelectWorld}
              selected={item.worldId === selectedWorldId}
              compact={numColumns > 1}
              saved={isWorldInAnyList(item.worldId)}
              onOpenSave={() => setSaveWorldId(item.worldId)}
            />
          </View>
        )}
        keyExtractor={(world: World) => world.worldId}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + Spacing.three }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      {saveWorldId ? (
        <SaveToListDialog
          worldId={saveWorldId}
          open
          onOpenChange={(next) => {
            if (!next) {
              setSaveWorldId(null);
            }
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: LIST_CONTENT_PADDING_H,
  },
  header: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  intro: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  cell: {
    flex: 1,
    marginHorizontal: CARD_MARGIN_H,
    marginBottom: theme.spacing.md,
  },
}));
