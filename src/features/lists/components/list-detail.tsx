import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLists } from '@/features/lists/ListsContext';
import { ListFormDialog } from '@/features/lists/components/list-form-dialog';
import { ListIcon } from '@/features/lists/components/list-icon';
import { useWorldsByIds } from '@/features/lists/hooks/use-worlds-by-ids';
import { WorldCard } from '@/features/worlds/components/world-card';
import type { World } from '@/features/worlds/types';

const MEMO_PREVIEW_LENGTH = 128;

interface ListDetailProps {
  listId: string;
  onBack?: () => void;
  onDeleted?: () => void;
  onBrowseWorlds?: () => void;
  onSelectWorld?: (worldId: string) => void;
  selectedWorldId?: string;
}

export function ListDetail({
  listId,
  onBack,
  onDeleted,
  onBrowseWorlds,
  onSelectWorld,
  selectedWorldId,
}: ListDetailProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    getList,
    updateList,
    deleteList,
    removeWorldFromList,
    exportList,
    skipRemoveWorldConfirmation,
    setSkipRemoveWorldConfirmation,
  } = useLists();
  const [formOpen, setFormOpen] = useState(false);
  const [memoExpanded, setMemoExpanded] = useState(false);

  const list = getList(listId);
  const ids = list?.worldIds ?? [];
  const worlds = useWorldsByIds(ids);

  if (!list) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          {onBack ? <BackButton label={t('worlds.back')} onPress={onBack} /> : null}
          <Text style={styles.notFound}>{t('lists.listNotFound')}</Text>
        </View>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert(
      t('lists.deleteConfirmTitle'),
      t('lists.deleteConfirmMessage', { name: list.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteList(list.id);
            onDeleted?.();
          },
        },
      ],
    );
  };

  const removeWorld = (worldId: string) => {
    removeWorldFromList(list.id, worldId);
  };

  const requestRemove = (worldId: string) => {
    if (skipRemoveWorldConfirmation) {
      removeWorld(worldId);
      return;
    }
    Alert.alert(t('lists.removeWorldConfirmTitle'), t('lists.removeWorldConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('lists.remove'),
        style: 'destructive',
        onPress: () => removeWorld(worldId),
      },
      {
        text: t('lists.dontAskAgain'),
        onPress: () => {
          setSkipRemoveWorldConfirmation(true);
          removeWorld(worldId);
        },
      },
    ]);
  };

  const selectWorld = (world: World) => {
    if (onSelectWorld) {
      onSelectWorld(world.worldId);
      return;
    }
    router.push({ pathname: '/worlds/[worldId]', params: { worldId: world.worldId } });
  };

  const isLoading = list.worldIds.length > 0 && worlds.every((entry) => entry.isPending);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {onBack ? <BackButton label={t('worlds.back')} onPress={onBack} /> : null}

        <View style={styles.header}>
          <View style={[styles.iconBubble, { backgroundColor: `${list.color}20` }]}>
            <ListIcon icon={list.icon} color={list.color} size={22} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{list.name}</Text>
            {list.memo ? (
              <View>
                <Text style={styles.memo}>
                  {memoExpanded || list.memo.length <= MEMO_PREVIEW_LENGTH
                    ? list.memo
                    : `${list.memo.slice(0, MEMO_PREVIEW_LENGTH)}…`}
                </Text>
                {list.memo.length > MEMO_PREVIEW_LENGTH ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setMemoExpanded((expanded) => !expanded)}>
                    <Text style={styles.memoToggle}>
                      {memoExpanded ? t('lists.memoViewLess') : t('lists.memoViewMore')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            <Text style={styles.count}>
              {t('lists.worldCount', { count: list.worldIds.length })}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <ActionButton
            icon={{ ios: 'square.and.arrow.up', android: 'share' }}
            label={t('lists.exportList')}
            onPress={() => exportList(list)}
          />
          <ActionButton
            icon={{ ios: 'pencil', android: 'edit' }}
            label={t('common.edit')}
            onPress={() => setFormOpen(true)}
          />
          <ActionButton
            icon={{ ios: 'trash', android: 'delete' }}
            label={t('common.delete')}
            destructive
            onPress={confirmDelete}
          />
        </View>

        {list.worldIds.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('lists.emptyDetailTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('lists.emptyDetailSubtitle')}</Text>
            {onBrowseWorlds ? (
              <Pressable
                accessibilityRole="button"
                onPress={onBrowseWorlds}
                style={styles.browseButton}>
                <Text style={styles.browseLabel}>{t('lists.browseWorlds')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={theme.colors.textMuted} style={styles.loading} />
        ) : (
          <View style={styles.grid}>
            {worlds.map((entry) =>
              entry.world ? (
                <View key={entry.worldId} style={styles.cell}>
                  <WorldCard
                    world={entry.world}
                    onSelect={selectWorld}
                    selected={entry.world.worldId === selectedWorldId}
                    onRemove={() => requestRemove(entry.worldId)}
                    compact
                  />
                </View>
              ) : (
                <View key={entry.worldId} style={styles.cell}>
                  <View style={styles.deletedCard}>
                    <Text style={styles.deletedLabel}>{t('lists.loadWorldError')}</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => requestRemove(entry.worldId)}>
                      <Text style={styles.deletedAction}>{t('lists.remove')}</Text>
                    </Pressable>
                  </View>
                </View>
              ),
            )}
          </View>
        )}
      </ScrollView>

      <ListFormDialog
        open={formOpen}
        list={list}
        onOpenChange={setFormOpen}
        onSubmit={(input) => {
          updateList(list.id, input);
          return true;
        }}
      />
    </View>
  );
}

interface BackButtonProps {
  label: string;
  onPress: () => void;
}

function BackButton({ label, onPress }: BackButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.back}>
      <SymbolView
        name={{ ios: 'chevron.left', android: 'arrow_back' }}
        size={16}
        tintColor={theme.colors.text}
      />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
}

interface ActionButtonProps {
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function ActionButton({ icon, label, onPress, destructive = false }: ActionButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.actionButton}>
      <SymbolView
        name={icon}
        size={16}
        tintColor={destructive ? theme.colors.danger : theme.colors.text}
      />
      <Text style={[styles.actionLabel, destructive ? styles.actionLabelDanger : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  backLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  notFound: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  iconBubble: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  memo: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  memoToggle: {
    ...theme.typography.label,
    marginTop: theme.spacing.xs,
    color: theme.colors.primary,
  },
  count: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  actionLabelDanger: {
    color: theme.colors.danger,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  emptySubtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  browseButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  browseLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  loading: {
    paddingVertical: theme.spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  cell: {
    width: '50%',
    padding: theme.spacing.xs,
  },
  deletedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  deletedLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  deletedAction: {
    ...theme.typography.label,
    color: theme.colors.danger,
  },
}));
