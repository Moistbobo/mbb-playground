import type { SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Spacing } from '@/constants/theme';
import { NavItem } from '@/features/worlds/components/nav-item';
import type { NavigationMode } from '@/features/worlds/lib/window-size';
import { NAVIGATION_RAIL_WIDTH } from '@/features/worlds/lib/window-size';

type Section = 'worlds' | 'lists';

interface Destination {
  id: Section | 'debug';
  labelKey: string;
  icon: SymbolViewProps['name'];
}

const DEBUG_DESTINATION = 'debug';

const DESTINATIONS: Destination[] = [
  { id: 'worlds', labelKey: 'worlds.nav.worlds', icon: { ios: 'globe', android: 'public' } },
  { id: 'lists', labelKey: 'worlds.nav.lists', icon: { ios: 'list.bullet', android: 'list' } },
  {
    id: 'debug',
    labelKey: 'worlds.nav.debug',
    icon: { ios: 'ladybug.fill', android: 'bug_report' },
  },
];

interface WorldsNavigationProps {
  navigationMode: NavigationMode;
  section: Section;
  onSelectSection: (section: Section) => void;
  debugActive: boolean;
  onToggleDebug: () => void;
  children: ReactNode;
}

export function WorldsNavigation({
  navigationMode,
  section,
  onSelectSection,
  debugActive,
  onToggleDebug,
  children,
}: WorldsNavigationProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRail = navigationMode === 'navigation-rail';

  const items = DESTINATIONS.map((destination) => {
    const isDebug = destination.id === DEBUG_DESTINATION;
    const isFocused = isDebug ? debugActive : destination.id === section;
    return (
      <NavItem
        key={destination.id}
        variant={isRail ? 'rail' : 'bottom'}
        label={t(destination.labelKey)}
        icon={destination.icon}
        isFocused={isFocused}
        onPress={
          isDebug ? onToggleDebug : () => onSelectSection(destination.id as Section)
        }
      />
    );
  });

  const rail = (
    <View
      style={[
        styles.rail,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + Spacing.three,
          paddingLeft: insets.left + Spacing.two,
          paddingRight: Spacing.two,
        },
      ]}>
      {items}
    </View>
  );

  const bottomBar = (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.one }]}>{items}</View>
  );

  return (
    <View style={[styles.root, isRail ? styles.rootSide : styles.rootBottom]}>
      {isRail ? rail : null}
      <View style={styles.content}>{children}</View>
      {isRail ? null : bottomBar}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  rootSide: {
    flexDirection: 'row',
  },
  rootBottom: {
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  rail: {
    width: NAVIGATION_RAIL_WIDTH,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
