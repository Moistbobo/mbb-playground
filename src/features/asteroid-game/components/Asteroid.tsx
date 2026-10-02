import { StyleSheet } from 'react-native-unistyles';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { ASTEROID_COLOR, ASTEROID_SIZE } from '../constants';
import type { World } from '../hooks/useDodgeGame';

export function Asteroid({ world, slot }: { world: SharedValue<World>; slot: number }) {
  const style = useAnimatedStyle(() => {
    const asteroid = world.value.asteroids[slot];
    return {
      opacity: asteroid.active ? 1 : 0,
      transform: [{ translateX: asteroid.x }, { translateY: asteroid.y }],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.asteroid, style]} />;
}

const styles = StyleSheet.create({
  asteroid: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    backgroundColor: ASTEROID_COLOR,
  },
});
