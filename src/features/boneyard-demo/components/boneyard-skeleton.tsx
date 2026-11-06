import { Skeleton } from 'boneyard-js/native';
import type { ReactNode } from 'react';
import { useUnistyles } from 'react-native-unistyles';

interface BoneyardSkeletonProps {
  name: string;
  loading: boolean;
  children: ReactNode;
}

export function BoneyardSkeleton({ name, loading, children }: BoneyardSkeletonProps) {
  const { theme } = useUnistyles();

  return (
    <Skeleton
      name={name}
      loading={loading}
      color={theme.colors.backgroundElement}
      darkColor={theme.colors.backgroundElement}
      animate="shimmer"
      transition
      style={
        loading
          ? {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }
          : undefined
      }>
      {children}
    </Skeleton>
  );
}
