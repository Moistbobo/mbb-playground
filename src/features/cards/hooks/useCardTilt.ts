import { useCallback, useState } from 'react';
import { Gesture, type ComposedGesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { CALIBRATION_MAX_DEVIATION, CALIBRATION_SAMPLES, GAIN } from '../constants';
import {
  EMPTY_CALIBRATION,
  ZERO,
  baselineDelta,
  calibrationZero,
  clamp,
  clampTilt,
  combineTilt,
  nextCalibration,
  type Calibration,
  type Vec2,
} from '../tilt';

const RELEASE_SPRING = { duration: 420, dampingRatio: 1.1 };
const RELEASE_TIMING = { duration: 200 };
const DRAG_DELTA_LIMIT = 1;

export type CardTiltOptions = {
  /** Pixels of drag that reach full tilt. */
  dragRange: number;
  reduceMotion: boolean;
};

export type CardTilt = {
  /** The single value every layer reads. */
  tilt: SharedValue<Vec2>;
  gesture: ComposedGesture;
  recenter: () => void;
  /** True once a real attitude callback has landed, never derived at render time. */
  sensorAvailable: boolean;
  /** Fed by AttitudeSensor; runs on the UI thread. */
  ingestSample: (sample: Vec2) => void;
  /** Dev-only simulator override; writes tilt directly (spec 10.5). */
  setTiltOverride: (next: Vec2) => void;
};

export function useCardTilt({ dragRange, reduceMotion }: CardTiltOptions): CardTilt {
  const tilt = useSharedValue<Vec2>(ZERO);
  const sensorTilt = useSharedValue<Vec2>(ZERO);
  const base = useSharedValue<Vec2>(ZERO);
  const delta = useSharedValue<Vec2>(ZERO);
  const dragging = useSharedValue(false);
  const attitude = useSharedValue<Vec2>(ZERO);
  const zero = useSharedValue<Vec2>(ZERO);
  const calibration = useSharedValue<Calibration>(EMPTY_CALIBRATION);
  const sensorReady = useSharedValue(false);
  const firstSample = useSharedValue<Vec2 | null>(null);

  const [sensorAvailable, setSensorAvailable] = useState(false);
  const markSensorAvailable = useCallback(() => setSensorAvailable(true), []);

  const ingestSample = useCallback(
    (sample: Vec2) => {
      'worklet';
      if (!sensorReady.value) {
        // The reaction fires once on mount with the zero value, and again if
        // it re-registers. Only a sample that differs from that initial one
        // can have come from the native sensor (spec 10.4).
        const first = firstSample.value;
        if (first === null) {
          firstSample.set(sample);
          return;
        }
        if (first.x === sample.x && first.y === sample.y) {
          return;
        }
        sensorReady.set(true);
        scheduleOnRN(markSensorAvailable);
      }

      attitude.set(sample);

      if (calibration.value.count < CALIBRATION_SAMPLES) {
        calibration.set(
          nextCalibration(calibration.value, sample, CALIBRATION_MAX_DEVIATION),
        );
        if (calibration.value.count >= CALIBRATION_SAMPLES) {
          const next = calibrationZero(calibration.value);
          if (next !== null) {
            zero.set(next);
          }
        }
        return;
      }

      sensorTilt.set(baselineDelta(sample, zero.value, GAIN));
    },
    [attitude, calibration, firstSample, markSensorAvailable, sensorReady, sensorTilt, zero],
  );

  const resetTilt = useCallback(() => {
    'worklet';
    cancelAnimation(delta);
    zero.set(attitude.value);
    calibration.set({ count: CALIBRATION_SAMPLES, sumX: 0, sumY: 0 });
    sensorTilt.set(ZERO);
    base.set(ZERO);
    delta.set(ZERO);
    dragging.set(false);
    tilt.set(ZERO);
  }, [attitude, base, calibration, delta, dragging, sensorTilt, tilt, zero]);

  const recenter = useCallback(() => {
    scheduleOnUI(resetTilt);
  }, [resetTilt]);

  const setTiltOverride = useCallback(
    (next: Vec2) => {
      scheduleOnUI(() => {
        'worklet';
        dragOverrideTilt(tilt, delta, dragging, next);
      });
    },
    [delta, dragging, tilt],
  );

  const pan = Gesture.Pan()
    // The card lives inside a ScrollView. Claiming any drag would make the
    // screen unscrollable, since the card covers most of it, so the pan only
    // activates on horizontal movement; vertical drags fall through to the
    // scroll view. Once active it tracks both axes, and the attitude sensor
    // covers vertical tilt on devices that have one.
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      'worklet';
      cancelAnimation(delta);
      base.set(tilt.value);
      delta.set(ZERO);
      dragging.set(true);
    })
    .onChange((event) => {
      'worklet';
      const range = Math.max(dragRange, 1);
      const nextDelta = {
        x: clamp(delta.value.x + event.changeX / range, -DRAG_DELTA_LIMIT, DRAG_DELTA_LIMIT),
        y: clamp(delta.value.y + event.changeY / range, -DRAG_DELTA_LIMIT, DRAG_DELTA_LIMIT),
      };
      delta.set(nextDelta);
      tilt.set(combineTilt(base.value, nextDelta));
    })
    .onFinalize(() => {
      'worklet';
      if (!dragging.value) {
        return;
      }
      cancelAnimation(delta);
      // Hand the finger's offset to the live sensor value, so release is
      // continuous and the spring converges on sensorTilt, not on a stale base.
      delta.set({
        x: tilt.value.x - sensorTilt.value.x,
        y: tilt.value.y - sensorTilt.value.y,
      });
      dragging.set(false);
      delta.set(
        reduceMotion ? withTiming(ZERO, RELEASE_TIMING) : withSpring(ZERO, RELEASE_SPRING),
      );
    });

  const tap = Gesture.Tap().onEnd((_event, success) => {
    'worklet';
    if (success) {
      resetTilt();
    }
  });

  const gesture = Gesture.Exclusive(pan, tap);

  useAnimatedReaction(
    () => ({ sensor: sensorTilt.value, drag: delta.value, active: dragging.value }),
    (next) => {
      if (next.active) {
        return;
      }
      tilt.set(combineTilt(next.sensor, next.drag));
    },
  );

  return { tilt, gesture, recenter, sensorAvailable, ingestSample, setTiltOverride };
}

function dragOverrideTilt(
  tilt: SharedValue<Vec2>,
  delta: SharedValue<Vec2>,
  dragging: SharedValue<boolean>,
  next: Vec2,
): void {
  'worklet';
  cancelAnimation(delta);
  delta.set(ZERO);
  dragging.set(false);
  tilt.set(clampTilt(next));
}
