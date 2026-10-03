/// <reference types="jest" />

import type { LayoutInfo } from '@logicwind/react-native-fold-detection';

import { toDevicePosture, toHingeInfo } from '@/features/worlds/lib/fold-posture';

function layout(
  orientation: LayoutInfo['orientation'],
  bounds?: LayoutInfo['bounds'],
): LayoutInfo {
  return {
    state: 'FLAT',
    occlusionType: 'NONE',
    orientation,
    isSeparating: false,
    isFoldSupported: true,
    displayFeatures: [],
    bounds,
  };
}

const bounds = (top: number, bottom: number, left: number, right: number) => ({
  top,
  bottom,
  left,
  right,
});

describe('toDevicePosture', () => {
  it('prefers tabletop when both flags are set', () => {
    expect(toDevicePosture(true, true)).toBe('tabletop');
  });

  it('returns book when only the book flag is set', () => {
    expect(toDevicePosture(false, true)).toBe('book');
  });

  it('returns flat otherwise', () => {
    expect(toDevicePosture(false, false)).toBe('flat');
    expect(toDevicePosture(true, false)).toBe('tabletop');
  });
});

describe('toHingeInfo', () => {
  it('returns null when bounds are missing', () => {
    expect(toHingeInfo(layout('VERTICAL'), 2)).toBeNull();
  });

  it('reads left and right for a vertical fold', () => {
    expect(toHingeInfo(layout('VERTICAL', bounds(0, 0, 20, 60)), 2)).toEqual({
      orientation: 'vertical',
      center: 20,
    });
  });

  it('reads top and bottom for a horizontal fold', () => {
    expect(toHingeInfo(layout('HORIZONTAL', bounds(20, 60, 0, 0)), 2)).toEqual({
      orientation: 'horizontal',
      center: 20,
    });
  });

  it('divides the raw bounds by the pixel ratio', () => {
    expect(toHingeInfo(layout('VERTICAL', bounds(0, 0, 8, 24)), 4)).toEqual({
      orientation: 'vertical',
      center: 4,
    });
  });

  it('returns null when an edge is not finite', () => {
    expect(toHingeInfo(layout('VERTICAL', bounds(0, 0, Number.NaN, 30)), 2)).toBeNull();
    expect(toHingeInfo(layout('HORIZONTAL', bounds(0, Number.POSITIVE_INFINITY, 0, 0)), 2)).toBeNull();
  });
});
