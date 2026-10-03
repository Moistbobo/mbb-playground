import type { LayoutInfo } from '@logicwind/react-native-fold-detection';
import { PixelRatio } from 'react-native';

export type DevicePosture = 'flat' | 'tabletop' | 'book';

export interface HingeInfo {
  orientation: 'vertical' | 'horizontal';
  center: number;
}

export function toDevicePosture(isTableTop: boolean, isBook: boolean): DevicePosture {
  if (isTableTop) {
    return 'tabletop';
  }
  if (isBook) {
    return 'book';
  }
  return 'flat';
}

export function toHingeInfo(layoutInfo: LayoutInfo, scale = PixelRatio.get()): HingeInfo | null {
  const bounds = layoutInfo.bounds;
  if (!bounds) {
    return null;
  }

  const isVertical = layoutInfo.orientation === 'VERTICAL';
  const start = (isVertical ? bounds.left : bounds.top) / scale;
  const end = (isVertical ? bounds.right : bounds.bottom) / scale;

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  return {
    orientation: isVertical ? 'vertical' : 'horizontal',
    center: (start + end) / 2,
  };
}
