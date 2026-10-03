import { useQueries } from '@tanstack/react-query';

import { fetchWorld, worldsKeys } from '@/features/worlds/api/worlds-query';
import type { World } from '@/features/worlds/types';

export interface WorldByIdEntry {
  worldId: string;
  world: World | undefined;
  isPending: boolean;
  isError: boolean;
}

export function useWorldsByIds(worldIds: string[]): WorldByIdEntry[] {
  const results = useQueries({
    queries: worldIds.map((worldId) => ({
      queryKey: worldsKeys.detail(worldId),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchWorld(worldId, signal),
    })),
  });

  return worldIds.map((worldId, index) => {
    const result = results[index];
    return {
      worldId,
      world: result.data,
      isPending: result.isPending,
      isError: result.isError,
    };
  });
}
