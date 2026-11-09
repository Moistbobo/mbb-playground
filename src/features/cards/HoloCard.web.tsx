import { Image } from 'expo-image';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Colors, Radius } from '@/constants/theme';

import { CARD_ASPECT } from './constants';

export type HoloCardProps = {
  width: number;
};

/** Web stub: the web bundle never resolves Skia, so the card is a static image. */
export function HoloCard({ width }: HoloCardProps) {
  const height = width / CARD_ASPECT;

  return (
    <View style={[styles.card, { width, height }]}>
      <Image
        source={require('@/assets/cards/card.jpg')}
        style={styles.image}
        contentFit="cover"
        accessibilityLabel="Holographic trading card"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  image: {
    flex: 1,
  },
});
