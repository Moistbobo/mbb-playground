/** Card face aspect from the source scan: 660 x 920. */
export const CARD_ASPECT = 660 / 920;

/** Maximum card rotation in degrees at |tilt| = 1. */
export const MAX_TILT_DEG = 35;

/** Attitude (radians) to tilt gain: full tilt at 35 degrees. */
export const GAIN = 1 / ((MAX_TILT_DEG * Math.PI) / 180);

/** `uLight = 0.5 + tilt * LIGHT_RANGE`, clamped to 0..1. Spec 9.3 item 2. */
export const LIGHT_RANGE = 0.45;

/** Attitude samples averaged into the zero baseline (spec 10.4). */
export const CALIBRATION_SAMPLES = 8;

/** A sample further than this from the running mean restarts calibration. */
export const CALIBRATION_MAX_DEVIATION = 0.12;

/** Drag travel that reaches full tilt: half the card width. */
export const DRAG_RANGE_FRACTION = 0.5;

/** Longest frame delta the glitter clock will accept. */
export const MAX_FRAME_DT_MS = 32;

export const PATTERNS = ['beams', 'cosmos', 'mosaic'] as const;
export type PatternName = (typeof PATTERNS)[number];
export type CardPattern = 0 | 1 | 2;

export const DEFAULT_PATTERN: CardPattern = 0;
export const DEFAULT_RAINBOW = 0.85;
export const DEFAULT_GLARE = 0.75;
export const DEFAULT_GLITTER = 0.5;
