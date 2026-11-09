import {
  IOSReferenceFrame,
  SensorType,
  useAnimatedSensor,
  useAnimatedReaction,
} from 'react-native-reanimated';

import type { Vec2 } from '../tilt';

const SENSOR_CONFIG = {
  interval: 'auto' as const,
  adjustToInterfaceOrientation: true,
  iosReferenceFrame: IOSReferenceFrame.XArbitraryZVertical,
};

/**
 * Mounts the attitude sensor and streams roll/pitch into `onSample`.
 * Mounted only while the screen is focused, so unmounting calls the hook's
 * own `unregister()` (spec 10.5) instead of sampling behind the user's back.
 */
export function AttitudeSensor({ onSample }: { onSample: (sample: Vec2) => void }) {
  const rotation = useAnimatedSensor(SensorType.ROTATION, SENSOR_CONFIG);

  useAnimatedReaction(
    () => rotation.sensor.value,
    (value) => {
      onSample({ x: value.roll, y: value.pitch });
    },
    [onSample],
  );

  return null;
}
