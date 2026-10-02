import { Image } from 'expo-image';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { APP_TITLE, AVATAR_URL } from '@/constants/portfolio';
import { Spacing } from '@/constants/theme';

export function HubHeader() {
  return (
    <View style={styles.header}>
      <ThemedView type="backgroundElement" style={styles.avatar}>
        <Image source={{ uri: AVATAR_URL }} contentFit="cover" style={styles.avatarImage} />
      </ThemedView>
      <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
        {APP_TITLE}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    flexShrink: 1,
  },
});
