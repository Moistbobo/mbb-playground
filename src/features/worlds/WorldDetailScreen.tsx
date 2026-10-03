import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { WorldDetailPane } from '@/features/worlds/components/world-detail-pane';
import { useAdaptiveLayout } from '@/features/worlds/hooks/use-adaptive-layout';

export function WorldDetailScreen() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { paneLayout } = useAdaptiveLayout();
  const params = useLocalSearchParams<{ worldId: string | string[] }>();
  const worldId = Array.isArray(params.worldId) ? params.worldId[0] : params.worldId;
  const isListDetail = paneLayout === 'list-detail';
  const previousPaneLayout = useRef(paneLayout);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/worlds');
  }, [router]);

  useEffect(() => {
    const previous = previousPaneLayout.current;
    previousPaneLayout.current = paneLayout;
    if (previous !== 'list-detail' && isListDetail) {
      handleBack();
    }
  }, [isListDetail, paneLayout, handleBack]);

  return (
    <WorldDetailPane
      worldId={worldId}
      header={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('worlds.goBack')}
          onPress={handleBack}
          style={styles.backButton}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back' }}
            size={16}
            tintColor={theme.colors.text}
          />
          <Text style={styles.backLabel}>{t('worlds.back')}</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  backLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
}));
