import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet as RNStyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { DEFAULT_LIST_COLOR, LIST_COLORS } from '@/features/lists/lib/list-colors';
import { MAX_LIST_MEMO_LENGTH, validateListMemo } from '@/features/lists/lib/list-memo-validation';
import type { CreateListInput, WorldList } from '@/features/lists/types';

interface ListFormDialogProps {
  open: boolean;
  list?: WorldList;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateListInput) => boolean;
}

export function ListFormDialog({ open, list, onOpenChange, onSubmit }: ListFormDialogProps) {
  if (!open) {
    return null;
  }
  return <ListFormContent list={list} onOpenChange={onOpenChange} onSubmit={onSubmit} />;
}

interface ListFormContentProps {
  list?: WorldList;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateListInput) => boolean;
}

function ListFormContent({ list, onOpenChange, onSubmit }: ListFormContentProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [name, setName] = useState(list?.name ?? '');
  const [icon, setIcon] = useState(list?.icon ?? '');
  const [color, setColor] = useState(list?.color ?? DEFAULT_LIST_COLOR);
  const [memo, setMemo] = useState(list?.memo ?? '');
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(list);
  const memoLength = memo.trim().length;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('lists.nameRequired'));
      return;
    }
    if (!validateListMemo(memo).valid) {
      setError(t('lists.memoTooLong'));
      return;
    }
    if (!onSubmit({ name: trimmed, icon: icon.trim() || null, color, memo })) {
      return;
    }
    onOpenChange(false);
  };

  const handleMemoChange = (value: string) => {
    setMemo(value);
    setError(validateListMemo(value).valid ? null : t('lists.memoTooLong'));
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          style={RNStyleSheet.absoluteFill}
          onPress={() => onOpenChange(false)}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEdit ? t('lists.editList') : t('lists.newList')}</Text>
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

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('lists.listName')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('lists.listNamePlaceholder')}
                placeholderTextColor={theme.colors.textSubtle}
                style={styles.input}
                accessibilityLabel={t('lists.listName')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('lists.listIcon')}</Text>
              <TextInput
                value={icon}
                onChangeText={setIcon}
                placeholder={t('lists.listIconPlaceholder')}
                placeholderTextColor={theme.colors.textSubtle}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                accessibilityLabel={t('lists.listIcon')}
              />
              <Text style={styles.hint}>{t('lists.listIconHint')}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('lists.listColor')}</Text>
              <View style={styles.swatchRow}>
                {LIST_COLORS.map((option) => {
                  const selected = option === color;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={option}
                      accessibilityState={{ selected }}
                      onPress={() => setColor(option)}
                      style={[
                        styles.swatch,
                        { backgroundColor: option },
                        selected ? styles.swatchSelected : null,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('lists.listMemo')}</Text>
              <TextInput
                value={memo}
                onChangeText={handleMemoChange}
                placeholder={t('lists.listMemoPlaceholder')}
                placeholderTextColor={theme.colors.textSubtle}
                maxLength={MAX_LIST_MEMO_LENGTH + 1}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.memoInput]}
                accessibilityLabel={t('lists.listMemo')}
              />
              <Text
                style={[
                  styles.counter,
                  memoLength > MAX_LIST_MEMO_LENGTH ? styles.counterError : null,
                ]}>
                {t('lists.memoCount', { count: memoLength })}
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenChange(false)}
              style={[styles.button, styles.buttonGhost]}>
              <Text style={styles.buttonGhostLabel}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={[styles.button, styles.buttonPrimary]}>
              <Text style={styles.buttonPrimaryLabel}>
                {isEdit ? t('common.save') : t('lists.createList')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  form: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  input: {
    ...theme.typography.body,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  memoInput: {
    minHeight: 84,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: theme.colors.text,
  },
  counter: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
  },
  counterError: {
    color: theme.colors.danger,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonGhostLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonPrimaryLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
}));
