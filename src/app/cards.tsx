import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import {
  DEFAULT_GLARE,
  DEFAULT_GLITTER,
  DEFAULT_PATTERN,
  DEFAULT_RAINBOW,
  FoilPicker,
  HoloCard,
  type CardPattern,
} from '@/features/cards';

export default function CardsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const [pattern, setPattern] = useState<CardPattern>(DEFAULT_PATTERN);
  const [rainbow, setRainbow] = useState(DEFAULT_RAINBOW);
  const [glare, setGlare] = useState(DEFAULT_GLARE);
  const [glitter, setGlitter] = useState(DEFAULT_GLITTER);

  const cardWidth = Math.min(screenWidth * 0.78, 360);

  return (
    // The scene is deliberately dark in both themes: screen-blended highlights
    // vanish on white. Same precedent as AsteroidGame (spec section 6).
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          // Keep the card's drag gesture from fighting the scroll: the card
          // claims horizontal drags, vertical drags scroll (see useCardTilt).
          bounces>
          <Text style={styles.title}>{t('cards.title')}</Text>
          <HoloCard
            width={cardWidth}
            pattern={pattern}
            rainbow={rainbow}
            glare={glare}
            glitter={glitter}
          />
          <FoilPicker
            pattern={pattern}
            onPatternChange={setPattern}
            rainbow={rainbow}
            onRainbowChange={setRainbow}
            glare={glare}
            onGlareChange={setGlare}
            glitter={glitter}
            onGlitterChange={setGlitter}
          />
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
  },
});
