import { FoldingFeatureProvider } from '@logicwind/react-native-fold-detection';
import type { PropsWithChildren } from 'react';
import { Platform, TurboModuleRegistry } from 'react-native';

const hasFoldingFeature =
  Platform.OS === 'android' && TurboModuleRegistry.get('FoldingFeature') != null;

export function FoldProvider({ children }: PropsWithChildren) {
  if (!hasFoldingFeature) {
    return <>{children}</>;
  }

  return <FoldingFeatureProvider>{children}</FoldingFeatureProvider>;
}
