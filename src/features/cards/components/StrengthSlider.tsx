import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { StyleSheet } from 'react-native-unistyles';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { clamp } from '../tilt';

type StrengthSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

const STEP = 0.1;

/** 0..1 strength control. Drag updates a shared value; JS hears once on release. */
export function StrengthSlider({ label, value, onChange }: StrengthSliderProps) {
  const trackWidth = useSharedValue(0);
  const level = useSharedValue(value);

  useEffect(() => {
    level.set(value);
  }, [level, value]);

  const commit = useCallback(() => {
    onChange(Math.round(level.value * 100) / 100);
  }, [level, onChange]);

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      'worklet';
      setLevelFromX(trackWidth, level, event.x);
    })
    .onChange((event) => {
      'worklet';
      setLevelFromX(trackWidth, level, event.x);
    })
    .onFinalize(() => {
      'worklet';
      scheduleOnRN(commit);
    });

  const fillStyle = useAnimatedStyle(() => ({ width: level.value * trackWidth.value }));

  const step = useCallback(
    (direction: 1 | -1) => {
      onChange(Math.round(clamp(value + direction * STEP, 0, 1) * 100) / 100);
    },
    [onChange, value],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <GestureDetector gesture={gesture}>
        <View
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') {
              step(1);
            }
            if (event.nativeEvent.actionName === 'decrement') {
              step(-1);
            }
          }}
          onLayout={(event) => {
            trackWidth.set(event.nativeEvent.layout.width);
          }}
          style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

function setLevelFromX(
  trackWidth: SharedValue<number>,
  level: SharedValue<number>,
  x: number,
): void {
  'worklet';
  level.set(clamp(x / Math.max(trackWidth.value, 1), 0, 1));
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
  },
  label: {
    width: 78,
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  track: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.dark.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Colors.dark.primary,
  },
});
