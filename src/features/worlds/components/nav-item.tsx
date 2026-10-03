import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type NavItemVariant = 'bottom' | 'rail';

export interface NavItemProps extends Omit<PressableProps, 'style'> {
  label: string;
  icon: SymbolViewProps['name'];
  variant: NavItemVariant;
  isFocused?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NavItem({
  label,
  icon,
  variant,
  isFocused = false,
  style,
  ...rest
}: NavItemProps) {
  const { theme } = useUnistyles();
  const tint = isFocused ? theme.colors.primary : theme.colors.textMuted;

  const itemVariant = variant === 'bottom' ? styles.itemBottom : styles.itemRail;
  const labelVariant = variant === 'bottom' ? styles.labelBottom : styles.labelRail;
  const showFocusBackground = isFocused && variant !== 'bottom';

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      {...rest}
      style={[styles.item, style, itemVariant, showFocusBackground ? styles.itemFocused : null]}>
      <SymbolView name={icon} size={22} tintColor={tint} />
      <Text
        numberOfLines={1}
        style={[styles.label, labelVariant, isFocused ? styles.labelFocused : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  itemFocused: {
    backgroundColor: theme.colors.primaryMuted,
  },
  itemBottom: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: theme.spacing.xs,
  },
  itemRail: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 60,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  labelBottom: {
    fontSize: 11,
  },
  labelRail: {
    fontSize: 11,
  },
  labelFocused: {
    color: theme.colors.primary,
  },
}));
