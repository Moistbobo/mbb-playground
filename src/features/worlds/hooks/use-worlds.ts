import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  HttpError,
  fetchWorld,
  fetchWorldTags,
  fetchWorldsPage,
  worldsKeys,
} from '../api/worlds-query';
import type { WorldsQuery } from '../types';

export function useInfiniteWorlds(params: WorldsQuery) {
  return useInfiniteQuery({
    queryKey: worldsKeys.list(params),
    queryFn: ({ pageParam, signal }) => fetchWorldsPage({ ...params, offset: pageParam }, signal),
    initialPageParam: params.offset,
    getNextPageParam: (lastPage) =>
      lastPage.offset + lastPage.limit < lastPage.total
        ? lastPage.offset + lastPage.limit
        : undefined,
  });
}

export function useWorld(worldId: string | undefined) {
  return useQuery({
    queryKey: worldsKeys.detail(worldId ?? ''),
    queryFn: ({ signal }) => fetchWorld(worldId as string, signal),
    enabled: Boolean(worldId),
    retry: (failureCount, error) =>
      !(error instanceof HttpError && error.status < 500) && failureCount < 2,
  });
}

export function useWorldTags() {
  return useQuery({
    queryKey: worldsKeys.tags(),
    queryFn: ({ signal }) => fetchWorldTags(signal),
    staleTime: Infinity,
  });
}

export function useWorldDetail(worldId: string | undefined) {
  const worldQuery = useWorld(worldId);
  const tagsQuery = useWorldTags();
  const tagMap = useMemo(
    () => new Map((tagsQuery.data ?? []).map((tag) => [tag.tag, tag])),
    [tagsQuery.data],
  );

  return { worldQuery, tagMap };
}
