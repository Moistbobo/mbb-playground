import type {
  HingeAngleInfo,
  LayoutInfo,
  SupportedPosture,
} from '@logicwind/react-native-fold-detection';

import type { DevicePosture, HingeInfo } from '@/features/worlds/lib/fold-posture';

export interface DevicePostureState {
  posture: DevicePosture;
  hinge: HingeInfo | null;
  layoutInfo: LayoutInfo;
  hingeAngle: HingeAngleInfo;
  supportedPostures: SupportedPosture[];
}

const DEFAULT_LAYOUT_INFO: LayoutInfo = {
  state: 'FLAT',
  occlusionType: 'NONE',
  orientation: 'VERTICAL',
  isSeparating: false,
  isFoldSupported: false,
  displayFeatures: [],
};

export function useDevicePosture(): DevicePostureState {
  return {
    posture: 'flat',
    hinge: null,
    layoutInfo: DEFAULT_LAYOUT_INFO,
    hingeAngle: { supported: false, angle: null },
    supportedPostures: [],
  };
}
