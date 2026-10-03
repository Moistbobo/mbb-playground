import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { WorldDetail } from '@/features/worlds/components/world-detail';
import { useWorldDetail } from '@/features/worlds/hooks/use-worlds';

interface WorldDetailPaneProps {
  worldId?: string;
  header?: ReactNode;
}

export function WorldDetailPane({ worldId, header }: WorldDetailPaneProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { worldQuery, tagMap } = useWorldDetail(worldId);

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.sm }]}>
      {header}

      {!worldId ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('worlds.emptyDetail')}</Text>
        </View>
      ) : worldQuery.isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.textMuted} />
        </View>
      ) : worldQuery.isError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            {t('worlds.failedWorld', {
              message: worldQuery.error instanceof Error ? worldQuery.error.message : t('worlds.unknownError'),
            })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('worlds.retry')}
            onPress={() => {
              void worldQuery.refetch();
            }}
            style={styles.retryButton}>
            <Text style={styles.retryLabel}>{t('worlds.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <WorldDetail world={worldQuery.data} tagMap={tagMap} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg - theme.spacing.xs,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  errorCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.danger,
  },
  retryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  retryLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
}));
