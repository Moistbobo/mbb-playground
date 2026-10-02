import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { PortfolioItem } from '@/constants/portfolio';
import { Spacing } from '@/constants/theme';

export function PortfolioTile({
  item,
  onPress,
}: {
  item: PortfolioItem;
  onPress: (item: PortfolioItem) => void;
}) {
  const { t } = useTranslation();
  const name = t(item.nameKey);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={styles.thumbnail}>
        <Image source={item.image} contentFit="contain" style={styles.image} />
      </ThemedView>
      <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
        {name}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '62%',
    height: '62%',
  },
  name: {
    textAlign: 'center',
  },
});
