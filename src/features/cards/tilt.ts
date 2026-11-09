/**
 * Pure tilt math shared by the gesture, the sensor and the tests.
 * Everything here runs on the UI thread, hence the `worklet` directives.
 */

export type Vec2 = { x: number; y: number };

export type Calibration = { count: number; sumX: number; sumY: number };

export const ZERO: Vec2 = { x: 0, y: 0 };

export const EMPTY_CALIBRATION: Calibration = { count: 0, sumX: 0, sumY: 0 };

export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/** Tilt is always a pair in -1..1. */
export function clampTilt(value: Vec2): Vec2 {
  'worklet';
  return { x: clamp(value.x, -1, 1), y: clamp(value.y, -1, 1) };
}

/** Attitude minus the zero baseline, scaled by gain and clamped to 1. */
export function baselineDelta(sample: Vec2, zero: Vec2, gain: number): Vec2 {
  'worklet';
  return clampTilt({ x: (sample.x - zero.x) * gain, y: (sample.y - zero.y) * gain });
}

/** Frozen-base drag: the gesture writes `base + delta`, never `sensor + delta`. */
export function combineTilt(base: Vec2, delta: Vec2): Vec2 {
  'worklet';
  return clampTilt({ x: base.x + delta.x, y: base.y + delta.y });
}

/** Glare travels toward the raised edge: `uLight = 0.5 + tilt * 0.45`. */
export function tiltToLight(tilt: Vec2, range = 0.45): Vec2 {
  'worklet';
  return {
    x: clamp(0.5 + tilt.x * range, 0, 1),
    y: clamp(0.5 + tilt.y * range, 0, 1),
  };
}

function distance(a: Vec2, b: Vec2): number {
  'worklet';
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Adds a sample to the baseline average. A sample far from the running mean
 * means the user is moving, so the average restarts rather than baking in
 * motion (spec 10.4, start condition 2).
 */
export function nextCalibration(
  previous: Calibration,
  sample: Vec2,
  maxDeviation: number,
): Calibration {
  'worklet';
  if (previous.count > 0) {
    const mean = {
      x: previous.sumX / previous.count,
      y: previous.sumY / previous.count,
    };
    if (distance(sample, mean) > maxDeviation) {
      return { count: 1, sumX: sample.x, sumY: sample.y };
    }
  }
  return {
    count: previous.count + 1,
    sumX: previous.sumX + sample.x,
    sumY: previous.sumY + sample.y,
  };
}

export function calibrationZero(calibration: Calibration): Vec2 | null {
  'worklet';
  if (calibration.count === 0) {
    return null;
  }
  return {
    x: calibration.sumX / calibration.count,
    y: calibration.sumY / calibration.count,
  };
}
