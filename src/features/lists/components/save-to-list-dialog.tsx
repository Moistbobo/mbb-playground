import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet as RNStyleSheet, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLists } from '@/features/lists/ListsContext';
import { ListFormDialog } from '@/features/lists/components/list-form-dialog';
import { ListIcon } from '@/features/lists/components/list-icon';

interface SaveToListDialogProps {
  worldId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToListDialog({ worldId, open, onOpenChange }: SaveToListDialogProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { lists, isWorldInList, toggleWorldInList, createList, addWorldToList } = useLists();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => onOpenChange(false)}>
        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            style={RNStyleSheet.absoluteFill}
            onPress={() => onOpenChange(false)}
          />
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('lists.saveToList')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                onPress={() => onOpenChange(false)}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close' }}
                  size={18}
                  tintColor={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            {lists.length === 0 ? (
              <Text style={styles.empty}>{t('lists.noListsYet')}</Text>
            ) : (
              <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
                {lists.map((list) => {
                  const checked = isWorldInList(worldId, list.id);
                  return (
                    <Pressable
                      key={list.id}
                      accessibilityRole="checkbox"
                      accessibilityLabel={list.name}
                      accessibilityState={{ checked }}
                      onPress={() => toggleWorldInList(list.id, worldId)}
                      style={styles.row}>
                      <SymbolView
                        name={{
                          ios: checked ? 'checkmark.circle.fill' : 'circle',
                          android: checked ? 'check_circle' : 'radio_button_unchecked',
                        }}
                        size={22}
                        tintColor={checked ? theme.colors.primary : theme.colors.textSubtle}
                      />
                      <ListIcon icon={list.icon} color={list.color} size={18} />
                      <Text numberOfLines={1} style={styles.rowLabel}>
                        {list.name}
                      </Text>
                      <Text style={styles.rowCount}>{list.worldIds.length}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowCreate(true)}
              style={styles.createButton}>
              <SymbolView
                name={{ ios: 'plus', android: 'add' }}
                size={16}
                tintColor={theme.colors.primary}
              />
              <Text style={styles.createLabel}>{t('lists.createNewListInline')}</Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onOpenChange(false)}
                style={styles.doneButton}>
                <Text style={styles.doneLabel}>{t('common.done')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ListFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={(input) => {
          const result = createList(input);
          addWorldToList(result.list.id, worldId);
          return true;
        }}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  empty: {
    ...theme.typography.body,
    paddingVertical: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  listScroll: {
    maxHeight: 280,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowLabel: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
  },
  rowCount: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
  },
  createButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  createLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  doneButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  doneLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
}));
