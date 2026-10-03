import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ListIcon } from '@/features/lists/components/list-icon';
import type { WorldList } from '@/features/lists/types';

interface ListCardProps {
  list: WorldList;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  compact?: boolean;
}

export function ListCard({
  list,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  compact = false,
}: ListCardProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={list.name}
      onPress={onSelect}
      style={[styles.card, compact ? styles.cardCompact : null]}>
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: `${list.color}20` }]}>
          <ListIcon icon={list.icon} color={list.color} size={20} />
        </View>

        <View style={styles.body}>
          <Text numberOfLines={compact ? 2 : 1} style={styles.name}>
            {list.name}
          </Text>
          {list.memo ? (
            <Text numberOfLines={2} style={styles.memo}>
              {list.memo}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            {t('lists.worldCount', { count: list.worldIds.length })} ·{' '}
            {t('lists.updated', { date: new Date(list.updatedAt).toLocaleDateString() })}
          </Text>
        </View>
      </View>

      <View style={[styles.actions, compact ? styles.actionsCompact : null]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lists.exportList')}
          hitSlop={6}
          onPress={onExport}
          style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'square.and.arrow.up', android: 'share' }}
            size={18}
            tintColor={theme.colors.textMuted}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lists.editList')}
          hitSlop={6}
          onPress={onEdit}
          style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'pencil', android: 'edit' }}
            size={18}
            tintColor={theme.colors.textMuted}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lists.deleteList')}
          hitSlop={6}
          onPress={onDelete}
          style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'trash', android: 'delete' }}
            size={18}
            tintColor={theme.colors.danger}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  iconBubble: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  memo: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionsCompact: {
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
}));
