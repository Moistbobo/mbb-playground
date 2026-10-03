import { StyleSheet } from 'react-native-unistyles';
import { Text, View } from 'react-native';

import { getPlatformLabel } from '@/features/worlds/lib/platform-label';

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{getPlatformLabel(platform)}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
}));
