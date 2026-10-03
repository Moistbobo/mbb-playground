import { useFoldingFeature } from '@logicwind/react-native-fold-detection';
import type {
  HingeAngleInfo,
  LayoutInfo,
  SupportedPosture,
} from '@logicwind/react-native-fold-detection';
import { useMemo } from 'react';

import {
  toDevicePosture,
  toHingeInfo,
  type DevicePosture,
  type HingeInfo,
} from '@/features/worlds/lib/fold-posture';

export interface DevicePostureState {
  posture: DevicePosture;
  hinge: HingeInfo | null;
  layoutInfo: LayoutInfo;
  hingeAngle: HingeAngleInfo;
  supportedPostures: SupportedPosture[];
}

export function useDevicePosture(): DevicePostureState {
  const { isTableTop, isBook, layoutInfo, hingeAngle, supportedPostures } = useFoldingFeature();

  return useMemo(
    () => ({
      posture: toDevicePosture(isTableTop, isBook),
      hinge: toHingeInfo(layoutInfo),
      layoutInfo,
      hingeAngle,
      supportedPostures,
    }),
    [isTableTop, isBook, layoutInfo, hingeAngle, supportedPostures],
  );
}
