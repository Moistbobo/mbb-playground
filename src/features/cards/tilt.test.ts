/// <reference types="jest" />

import { CALIBRATION_MAX_DEVIATION, GAIN } from '@/features/cards/constants';
import {
  EMPTY_CALIBRATION,
  baselineDelta,
  calibrationZero,
  clamp,
  clampTilt,
  combineTilt,
  nextCalibration,
  tiltToLight,
} from '@/features/cards/tilt';

const degrees = (value: number) => (value * Math.PI) / 180;

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(0.4, -1, 1)).toBe(0.4);
  });

  it('clamps at both ends', () => {
    expect(clamp(3, -1, 1)).toBe(1);
    expect(clamp(-3, -1, 1)).toBe(-1);
  });
});

describe('clampTilt', () => {
  it('clamps each axis independently', () => {
    expect(clampTilt({ x: 2, y: -2 })).toEqual({ x: 1, y: -1 });
  });
});

describe('baselineDelta', () => {
  it('is zero when the sample matches the baseline', () => {
    expect(baselineDelta({ x: 0.3, y: -0.2 }, { x: 0.3, y: -0.2 }, GAIN)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('turns 35 degrees into full tilt', () => {
    const delta = baselineDelta({ x: degrees(35), y: 0 }, { x: 0, y: 0 }, GAIN);
    expect(delta.x).toBeCloseTo(1, 6);
  });

  it('keeps the sign of the sample minus the baseline', () => {
    expect(baselineDelta({ x: 0, y: 0 }, { x: 0, y: degrees(35) }, GAIN).y).toBeCloseTo(-1, 6);
  });

  it('clamps beyond full tilt', () => {
    expect(baselineDelta({ x: degrees(120), y: 0 }, { x: 0, y: 0 }, GAIN).x).toBe(1);
  });
});

describe('combineTilt (frozen-base drag)', () => {
  it('adds the drag delta to the frozen base', () => {
    const combined = combineTilt({ x: 0.2, y: -0.1 }, { x: 0.3, y: 0.3 });
    expect(combined.x).toBeCloseTo(0.5, 6);
    expect(combined.y).toBeCloseTo(0.2, 6);
  });

  it('returns the base when the delta springs back to zero', () => {
    const base = { x: -0.4, y: 0.7 };
    expect(combineTilt(base, { x: 0, y: 0 })).toEqual(base);
  });

  it('never double-counts the sensor value', () => {
    // The base already contains the sensor contribution; adding the sensor
    // again would push the card past full tilt.
    expect(combineTilt({ x: 1, y: 0 }, { x: 0.5, y: 0 })).toEqual({ x: 1, y: 0 });
  });

  it('does not mutate its inputs', () => {
    const base = { x: 0.1, y: 0.1 };
    const delta = { x: 0.2, y: 0.2 };
    combineTilt(base, delta);
    expect(base).toEqual({ x: 0.1, y: 0.1 });
    expect(delta).toEqual({ x: 0.2, y: 0.2 });
  });
});

describe('tiltToLight', () => {
  it('is neutral at rest', () => {
    expect(tiltToLight({ x: 0, y: 0 })).toEqual({ x: 0.5, y: 0.5 });
  });

  it('moves with the tilt, toward the raised edge', () => {
    expect(tiltToLight({ x: 1, y: 0 }).x).toBeCloseTo(0.95, 6);
    expect(tiltToLight({ x: -1, y: 0 }).x).toBeCloseTo(0.05, 6);
  });

  it('clamps to the 0..1 light range', () => {
    // 0.45 range on a clamped tilt cannot leave 0..1, but guard the contract.
    expect(tiltToLight({ x: 1, y: 1 }, 2).x).toBe(1);
    expect(tiltToLight({ x: -1, y: -1 }, 2).x).toBe(0);
  });
});

describe('nextCalibration', () => {
  it('reports no zero before the first sample', () => {
    expect(calibrationZero(EMPTY_CALIBRATION)).toBeNull();
  });

  it('averages steady samples', () => {
    let calibration = EMPTY_CALIBRATION;
    calibration = nextCalibration(calibration, { x: 0.1, y: 0.2 }, CALIBRATION_MAX_DEVIATION);
    calibration = nextCalibration(calibration, { x: 0.12, y: 0.22 }, CALIBRATION_MAX_DEVIATION);
    expect(calibration.count).toBe(2);
    const zero = calibrationZero(calibration);
    expect(zero?.x).toBeCloseTo(0.11, 6);
    expect(zero?.y).toBeCloseTo(0.21, 6);
  });

  it('restarts instead of averaging motion into the baseline', () => {
    let calibration = EMPTY_CALIBRATION;
    for (let i = 0; i < 4; i += 1) {
      calibration = nextCalibration(
        calibration,
        { x: 0.1, y: 0.1 },
        CALIBRATION_MAX_DEVIATION,
      );
    }
    const afterJump = nextCalibration(
      calibration,
      { x: 0.9, y: 0.9 },
      CALIBRATION_MAX_DEVIATION,
    );
    expect(afterJump.count).toBe(1);
    expect(calibrationZero(afterJump)).toEqual({ x: 0.9, y: 0.9 });
  });
});
