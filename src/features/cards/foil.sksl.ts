import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';

/**
 * One source, compiled once. `uPass` selects the layer:
 *   0 -> overlay (identity is mid-grey 0.5)
 *   1 -> screen  (identity is black)
 * Every return path is premultiplied: half4(rgb * a, a).
 */
export const FOIL_SKSL = `
uniform float2 uSize;
uniform float2 uTilt;
uniform float2 uLight;
uniform float uTime;
uniform float uRainbow;
uniform float uGlare;
uniform float uGlitter;
uniform float uPattern;
uniform float uPass;

float hash21(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + float2(1.0, 0.0));
  float c = hash21(i + float2(0.0, 1.0));
  float d = hash21(i + float2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float3 hsv2rgb(float3 c) {
  float3 rgb = clamp(abs(mod(c.x * 6.0 + float3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z * mix(float3(1.0, 1.0, 1.0), rgb, c.y);
}

float sdRoundBox(float2 p, float2 halfSize, float radius) {
  float2 q = abs(p) - halfSize + radius;
  return length(max(q, float2(0.0, 0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

// Foil coverage: inset rounded box, minus the printed text box at the bottom.
// The cutoff sits just above the text panel (70% of card height on the
// committed placeholder); retune if a real scan has a taller text box.
float foilMask(float2 uv) {
  float d = sdRoundBox(uv - 0.5, float2(0.457, 0.457), 0.05);
  float inside = 1.0 - smoothstep(-0.004, 0.004, d);
  float textBox = smoothstep(0.700, 0.718, uv.y);
  return inside * (1.0 - textBox);
}

// Printed grating: fixed in card space, so the pattern never slides with tilt.
float patternOffset(float2 uv, float pattern) {
  if (pattern < 0.5) {
    return 0.0;
  }
  if (pattern < 1.5) {
    return valueNoise(uv * 6.0) * 0.35;
  }
  float2 cell = floor(uv * 14.0) / 14.0;
  return valueNoise(cell) * 0.45;
}

half4 main(float2 fragCoord) {
  if (uSize.x <= 0.0 || uSize.y <= 0.0) {
    return half4(0.0);
  }

  float2 uv = fragCoord / uSize;
  float a = foilMask(uv);

  float2 dir = float2(1.05, 0.65);
  float band = dot(uv, dir) * 1.4
             + dot(uTilt, dir) * 0.22
             + patternOffset(uv, uPattern);

  // Foil is dull face-on and full when tilted: a 0.45 -> 1.0 lift, not a gate.
  float fres = mix(0.45, 1.0, smoothstep(0.0, 0.75, length(uTilt)));

  float3 col;
  if (uPass < 0.5) {
    // Overlay. uRainbow = 0 lands exactly on mid-grey, so the pass is a no-op.
    float3 hue = hsv2rgb(float3(fract(band), 0.72, 1.0));
    col = mix(float3(0.5, 0.5, 0.5), hue, uRainbow * fres);
  } else {
    // Screen. Zero strength emits black, which screen ignores.
    float d = abs(band - uLight.x);
    float streak = 1.0 - smoothstep(0.0, 0.28, d);
    float halo = 1.0 - smoothstep(0.0, 1.10, d);
    float cell = hash21(floor(uv * 48.0) + uLight * 6.0 + float2(uTime * 0.05, uTime * 0.05));
    float glint = smoothstep(0.985, 1.0, cell);
    col = float3(streak * uGlare, streak * uGlare, streak * uGlare)
        + float3(halo * 0.12 * uGlare, halo * 0.12 * uGlare, halo * 0.12 * uGlare)
        + float3(glint * streak * uGlitter, glint * streak * uGlitter, glint * streak * uGlitter);
  }

  return half4(half3(col * a), half(a));
}
`;

let cached: SkRuntimeEffect | null | undefined;
let compileCount = 0;

/**
 * Compiles on first use and caches for the lifetime of the bundle.
 * Native throws a JSError with the SkSL diagnostics; web returns null.
 */
export function getFoilEffect(): SkRuntimeEffect | null {
  if (cached !== undefined) {
    return cached;
  }
  compileCount += 1;
  try {
    cached = Skia.RuntimeEffect.Make(FOIL_SKSL);
  } catch (error) {
    cached = null;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[holo] foil shader failed to compile: ${message}`);
  }
  if (__DEV__ && cached !== null) {
    console.log(`[holo] foil effect compiled (#${compileCount})`);
  }
  return cached;
}
