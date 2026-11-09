import { useEffect } from 'react';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Uniforms } from '@shopify/react-native-skia';

import { MAX_FRAME_DT_MS } from '../constants';
import { clamp, tiltToLight, type Vec2 } from '../tilt';

export type FoilUniformsInput = {
  width: number;
  height: number;
  tilt: SharedValue<Vec2>;
  pattern: number;
  rainbow: number;
  glare: number;
  glitter: number;
  /** False on blur and under Reduce Motion: freezes the glitter clock. */
  animate: boolean;
};

export type FoilUniforms = {
  overlay: SharedValue<Uniforms>;
  screen: SharedValue<Uniforms>;
};

function buildUniforms(
  pass: 0 | 1,
  width: number,
  height: number,
  tilt: Vec2,
  time: number,
  pattern: number,
  rainbow: number,
  glare: number,
  glitter: number,
): Uniforms {
  'worklet';
  const light = tiltToLight(tilt);
  // A slow lamp drift keeps the card alive at rest without touching the flake
  // field: the sparkles glide with the light instead of blinking on their own.
  const drift = 0.035;
  return {
    uSize: [width, height],
    uTilt: [tilt.x, tilt.y],
    uLight: [
      clamp(light.x + Math.sin(time * 0.7) * drift, 0, 1),
      clamp(light.y + Math.cos(time * 0.53) * drift, 0, 1),
    ],
    uRainbow: rainbow,
    uGlare: glare,
    uGlitter: glitter,
    uPattern: pattern,
    uPass: pass,
  };
}

/**
 * Derives both layer uniform sets from the shared tilt. The only per-frame
 * work is two small object allocations; no React render takes part.
 */
export function useFoilUniforms({
  width,
  height,
  tilt,
  pattern,
  rainbow,
  glare,
  glitter,
  animate,
}: FoilUniformsInput): FoilUniforms {
  const time = useSharedValue(0);
  const running = useSharedValue(animate ? 1 : 0);

  useEffect(() => {
    running.set(animate ? 1 : 0);
    if (!animate) {
      time.set(0);
    }
  }, [animate, running, time]);

  useFrameCallback((frame) => {
    'worklet';
    if (running.value === 0) {
      return;
    }
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, MAX_FRAME_DT_MS);
    time.set(time.value + dt / 1000);
  });

  const overlay = useDerivedValue<Uniforms>(
    () => buildUniforms(0, width, height, tilt.value, time.value, pattern, rainbow, glare, glitter),
    [width, height, tilt, time, pattern, rainbow, glare, glitter],
  );

  const screen = useDerivedValue<Uniforms>(
    () => buildUniforms(1, width, height, tilt.value, time.value, pattern, rainbow, glare, glitter),
    [width, height, tilt, time, pattern, rainbow, glare, glitter],
  );

  return { overlay, screen };
}
