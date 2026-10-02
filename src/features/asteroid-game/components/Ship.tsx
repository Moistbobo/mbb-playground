import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { SHIP_BOTTOM_OFFSET, SHIP_COLOR, SHIP_HEIGHT, SHIP_WIDTH } from '../constants';
import type { World } from '../hooks/useDodgeGame';

export function Ship({ world }: { world: SharedValue<World> }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: world.value.shipX },
      { translateY: world.value.height - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT },
    ],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ship, style]} />;
}

const styles = StyleSheet.create({
  ship: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    backgroundColor: SHIP_COLOR,
  },
});
