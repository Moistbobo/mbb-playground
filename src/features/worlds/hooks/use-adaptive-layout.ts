import { getWindowSizeClass } from '@logicwind/react-native-fold-detection';
import { useEffect, useMemo, useState } from 'react';
import { Platform, TurboModuleRegistry, useWindowDimensions } from 'react-native';

import { useDevicePosture } from '@/features/worlds/hooks/use-device-posture';
import type { DevicePosture, HingeInfo } from '@/features/worlds/lib/fold-posture';
import {
  LIST_DETAIL_MIN_CARD_WIDTH,
  columnCountForPaneWidth,
} from '@/features/worlds/lib/list-layout';
import {
  MIN_LIST_EXTENT,
  NAVIGATION_RAIL_WIDTH,
  normalizeSizeClass,
  resolveAdaptiveLayout,
  type WindowLayout,
  type WindowSizeClass,
} from '@/features/worlds/lib/window-size';

export interface AdaptiveLayout extends WindowLayout {
  posture: DevicePosture;
  hinge: HingeInfo | null;
  listExtent?: number;
}

const hasFoldingFeature =
  Platform.OS === 'android' && TurboModuleRegistry.get('FoldingFeature') != null;

export function useAdaptiveLayout(): AdaptiveLayout {
  const { width, height } = useWindowDimensions();
  const { posture, hinge } = useDevicePosture();
  const [nativeSizeClass, setNativeSizeClass] = useState<WindowSizeClass | null>(null);

  useEffect(() => {
    if (!hasFoldingFeature) {
      return;
    }

    let active = true;
    getWindowSizeClass('V1').then(
      (value) => {
        if (active) {
          setNativeSizeClass(normalizeSizeClass(value.widthSizeClass));
        }
      },
      () => {
        if (active) {
          setNativeSizeClass(null);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [width, height]);

  return useMemo(() => {
    const base = resolveAdaptiveLayout({ width, nativeSizeClass });
    const hingeSplit = hinge?.orientation === 'vertical' ? hinge : null;

    if (!hingeSplit || base.paneLayout !== 'list-detail') {
      return { ...base, posture, hinge };
    }

    const listExtent = Math.max(hingeSplit.center - NAVIGATION_RAIL_WIDTH, MIN_LIST_EXTENT);

    return {
      ...base,
      posture,
      hinge,
      listExtent,
      listColumns: columnCountForPaneWidth(listExtent, LIST_DETAIL_MIN_CARD_WIDTH),
    };
  }, [width, nativeSizeClass, posture, hinge]);
}
