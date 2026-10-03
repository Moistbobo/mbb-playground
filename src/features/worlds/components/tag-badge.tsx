import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface TagBadgeProps {
  tag: string;
  emoji?: string;
  color?: string;
  full?: boolean;
}

export function TagBadge({ tag, emoji, color, full }: TagBadgeProps) {
  const { theme } = useUnistyles();
  const label = emoji ? `${emoji} ${tag}` : tag;

  return (
    <View
      style={[
        styles.badge,
        full ? styles.badgeFull : styles.badgeCompact,
        color ? { backgroundColor: `${color}1A`, borderColor: color } : null,
      ]}>
      <Text
        numberOfLines={full ? undefined : 1}
        style={[styles.label, color ? { color: theme.colors.text } : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  badgeCompact: {
    maxWidth: 140,
  },
  badgeFull: {
    maxWidth: '100%',
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
}));
