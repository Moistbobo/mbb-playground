import { useObserve } from 'expo-observe';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { HubHeader } from '@/components/hub-header';
import { PortfolioGrid } from '@/components/portfolio-grid';
import { ThemedView } from '@/components/themed-view';
import type { PortfolioItem } from '@/constants/portfolio';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { markInteractive } = useObserve();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const handlePressItem = useCallback(
    (item: PortfolioItem) => {
      if (item.id === 'dodge-objects') {
        router.push('/game');
        return;
      }
      Toast.show({
        type: 'success',
        text1: t('home.pressed', { name: t(item.nameKey) }),
        position: 'bottom',
        bottomOffset: BottomTabInset + Spacing.four,
        visibilityTime: 2000,
      });
    },
    [router, t],
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView
          style={[styles.safeArea, Platform.select({ web: { paddingTop: Spacing.six } })]}>
          <HubHeader />
          <PortfolioGrid onPressItem={handlePressItem} />
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
