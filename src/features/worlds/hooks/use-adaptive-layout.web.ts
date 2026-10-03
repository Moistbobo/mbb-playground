import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import type { DevicePosture, HingeInfo } from '@/features/worlds/lib/fold-posture';
import { resolveAdaptiveLayout, type WindowLayout } from '@/features/worlds/lib/window-size';

export interface AdaptiveLayout extends WindowLayout {
  posture: DevicePosture;
  hinge: HingeInfo | null;
  listExtent?: number;
}

export function useAdaptiveLayout(): AdaptiveLayout {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const base = resolveAdaptiveLayout({ width });

    return { ...base, posture: 'flat', hinge: null };
  }, [width]);
}
