import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const SKELETON_ROWS = 2;

interface ResultsHeaderProps {
  searchInput: string;
  onSearchChange: (text: string) => void;
  total: number;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  order: 'asc' | 'desc';
  onToggleOrder: () => void;
  numColumns: number;
}

export function ResultsHeader({
  searchInput,
  onSearchChange,
  total,
  isPending,
  isError,
  errorMessage,
  onRetry,
  order,
  onToggleOrder,
  numColumns,
}: ResultsHeaderProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const isAscending = order === 'asc';
  const showEmpty = !isPending && !isError && total === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('worlds.results')}</Text>

      <TextInput
        value={searchInput}
        onChangeText={onSearchChange}
        placeholder={t('worlds.searchPlaceholder')}
        placeholderTextColor={theme.colors.textSubtle}
        accessibilityLabel={t('worlds.searchLabel')}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.searchInput}
      />

      <View style={styles.controls}>
        <View style={styles.countRow}>
          <Text style={styles.countLabel}>{t('worlds.resultsCount')}</Text>
          {isPending ? (
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          ) : (
            <Text style={styles.countValue}>{total}</Text>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isAscending ? t('worlds.sortLabelOldest') : t('worlds.sortLabelNewest')
          }
          onPress={onToggleOrder}
          style={styles.sortButton}>
          <SymbolView
            name={
              isAscending
                ? { ios: 'arrow.up.circle', android: 'arrow_upward' }
                : { ios: 'arrow.down.circle', android: 'arrow_downward' }
            }
            size={16}
            tintColor={theme.colors.text}
          />
          <Text style={styles.sortLabel}>
            {isAscending ? t('worlds.sortOldest') : t('worlds.sortNewest')}
          </Text>
        </Pressable>
      </View>

      {isError ? (
        <View style={styles.statusCard}>
          <Text style={styles.errorText}>
            {t('worlds.failedWorlds', { message: errorMessage ?? t('worlds.unknownError') })}
          </Text>
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{t('worlds.retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      {isPending ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: numColumns * SKELETON_ROWS }).map((_, index) => (
            <View
              key={index}
              style={[styles.skeletonCard, numColumns > 1 ? styles.skeletonCardHalf : null]}
            />
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <View style={styles.statusCard}>
          <Text style={styles.emptyText}>{t('worlds.noWorlds')}</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{t('worlds.retry')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  searchInput: {
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  countRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  countValue: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  sortLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  statusCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.danger,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  retryButton: {
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
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  skeletonCard: {
    flexGrow: 1,
    flexBasis: '100%',
    height: 280,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
  },
  skeletonCardHalf: {
    flexBasis: '45%',
  },
}));
