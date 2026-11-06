import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { BoneyardSkeleton } from '@/features/boneyard-demo/components/boneyard-skeleton';
import { SAMPLE_WORLDS } from '@/features/boneyard-demo/fixtures';
import { useDemoLoad } from '@/features/boneyard-demo/hooks/use-demo-load';
import { WorldCard } from '@/features/worlds/components/world-card';

export function BoneyardDemoContent() {
  const { t } = useTranslation();
  const { phase, replay } = useDemoLoad(2000);
  const loading = phase === 'loading';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.intro}>
              <Text style={styles.title}>{t('boneyard.title')}</Text>
              <Text style={styles.subtitle}>{t('boneyard.subtitle')}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('boneyard.replay')}
              onPress={replay}
              style={styles.replayButton}>
              <Text style={styles.replayLabel}>{t('boneyard.replay')}</Text>
            </Pressable>
          </View>

          <View style={styles.cards}>
            {SAMPLE_WORLDS.map((world) => (
              <BoneyardSkeleton key={world.worldId} name="world-card" loading={loading}>
                <WorldCard world={world} onSelect={() => {}} />
              </BoneyardSkeleton>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.three,
  },
  intro: {
    gap: Spacing.one,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  replayButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  replayLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  cards: {
    gap: Spacing.three,
  },
}));
