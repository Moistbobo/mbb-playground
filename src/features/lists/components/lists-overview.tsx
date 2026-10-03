import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLists } from '@/features/lists/ListsContext';
import { ListCard } from '@/features/lists/components/list-card';
import { ListFormDialog } from '@/features/lists/components/list-form-dialog';
import type { WorldList } from '@/features/lists/types';

interface ListsOverviewProps {
  onSelectList: (listId: string) => void;
  compact?: boolean;
}

export function ListsOverview({ onSelectList, compact = false }: ListsOverviewProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { lists, error, createList, updateList, deleteList, clearError, exportList } = useLists();
  const [formOpen, setFormOpen] = useState(false);
  const [editingList, setEditingList] = useState<WorldList | undefined>(undefined);

  const openCreate = () => {
    setEditingList(undefined);
    setFormOpen(true);
  };

  const openEdit = (list: WorldList) => {
    setEditingList(list);
    setFormOpen(true);
  };

  const confirmDelete = (list: WorldList) => {
    Alert.alert(
      t('lists.deleteConfirmTitle'),
      t('lists.deleteConfirmMessage', { name: list.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteList(list.id),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing.md },
        ]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('lists.title')}</Text>
              <Text style={styles.count}>{t('lists.listCount', { count: lists.length })}</Text>
            </View>
            <Text style={styles.subtitle}>{t('lists.subtitle')}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('lists.newList')}
            onPress={openCreate}
            style={styles.newButton}>
            <Text style={styles.newLabel}>{t('lists.newList')}</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {t('lists.storageErrorMessage', { message: error })}
            </Text>
            <Pressable accessibilityRole="button" onPress={clearError}>
              <Text style={styles.dismiss}>{t('common.dismiss')}</Text>
            </Pressable>
          </View>
        ) : null}

        {lists.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('lists.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('lists.emptySubtitle')}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openCreate}
              style={styles.newButton}>
              <Text style={styles.newLabel}>{t('lists.createFirstList')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                compact={compact}
                onSelect={() => onSelectList(list.id)}
                onEdit={() => openEdit(list)}
                onDelete={() => confirmDelete(list)}
                onExport={() => exportList(list)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ListFormDialog
        key={editingList?.id ?? 'new'}
        open={formOpen}
        list={editingList}
        onOpenChange={setFormOpen}
        onSubmit={(input) => {
          if (editingList) {
            updateList(editingList.id, input);
            return true;
          }
          return createList(input).ok;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  count: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  newButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  newLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    ...theme.typography.caption,
    flex: 1,
    color: theme.colors.danger,
  },
  dismiss: {
    ...theme.typography.caption,
    color: theme.colors.primary,
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
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  list: {
    gap: theme.spacing.md,
  },
}));
