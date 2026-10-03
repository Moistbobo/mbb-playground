import { API_BASE_URL, API_TOKEN, WORLD_REQUEST_ORIGIN } from './api-config';
import type { PaginatedWorlds, World, WorldsQuery, WorldTag } from '../types';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const worldsKeys = {
  all: ['worlds'] as const,
  list: (params: WorldsQuery) => [...worldsKeys.all, 'list', params] as const,
  detail: (worldId: string) => [...worldsKeys.all, 'detail', worldId] as const,
  tags: () => [...worldsKeys.all, 'tags'] as const,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function getAuthorized(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Origin: WORLD_REQUEST_ORIGIN,
    },
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      isRecord(body) && typeof body.error === 'string' ? body.error : `HTTP ${response.status}`;
    throw new HttpError(response.status, message);
  }

  return response.json();
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value : '';
}

function readNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function parseWorld(raw: unknown): World {
  if (!isRecord(raw) || typeof raw.worldId !== 'string' || typeof raw.name !== 'string') {
    throw new Error('Invalid world payload');
  }

  const world: World = {
    worldId: raw.worldId,
    name: raw.name,
    authorName: readString(raw, 'authorName'),
    capacity: readNumber(raw, 'capacity'),
    platforms: readStringArray(raw, 'platforms'),
    tags: readStringArray(raw, 'tags'),
    imageUrl: readString(raw, 'imageUrl'),
    vrchatUrl: readString(raw, 'vrchatUrl'),
    quality: raw.quality === 'good' || raw.quality === 'bad' ? raw.quality : null,
    createdAt: readString(raw, 'createdAt'),
  };

  if (Array.isArray(raw.flags)) {
    world.flags = readStringArray(raw, 'flags');
  }
  if (typeof raw.highPriority === 'boolean') {
    world.highPriority = raw.highPriority;
  }
  if (typeof raw.guildId === 'string') {
    world.guildId = raw.guildId;
  }
  if (typeof raw.internalAddDate === 'string') {
    world.internalAddDate = raw.internalAddDate;
  }

  return world;
}

function parseWorldTag(raw: unknown): WorldTag | null {
  if (!isRecord(raw)) {
    return null;
  }
  const tag = readString(raw, 'tag');
  if (!tag) {
    return null;
  }
  const hexColor = readString(raw, 'hexColor').trim();
  return {
    tag,
    emoji: readString(raw, 'emoji'),
    hexColor: HEX_COLOR_PATTERN.test(hexColor) ? hexColor : '',
  };
}

function parsePaginatedWorlds(raw: unknown): PaginatedWorlds {
  if (!isRecord(raw) || !Array.isArray(raw.worlds)) {
    throw new Error('Invalid worlds response');
  }
  return {
    total: readNumber(raw, 'total'),
    limit: readNumber(raw, 'limit'),
    offset: readNumber(raw, 'offset'),
    worlds: raw.worlds.map(parseWorld),
  };
}

export async function fetchWorldsPage(
  params: WorldsQuery,
  signal?: AbortSignal,
): Promise<PaginatedWorlds> {
  const query = [
    `limit=${encodeURIComponent(String(params.limit))}`,
    `offset=${encodeURIComponent(String(params.offset))}`,
  ];
  if (params.minCapacity !== undefined) {
    query.push(`minCapacity=${encodeURIComponent(String(params.minCapacity))}`);
  }
  if (params.maxCapacity !== undefined) {
    query.push(`maxCapacity=${encodeURIComponent(String(params.maxCapacity))}`);
  }
  if (params.search?.trim()) {
    query.push(`search=${encodeURIComponent(params.search.trim())}`);
  }
  if (params.order === 'asc') {
    query.push('order=asc');
  }

  const body = await getAuthorized(`/api/worlds?${query.join('&')}`, signal);

  return parsePaginatedWorlds(body);
}

export async function fetchWorld(worldId: string, signal?: AbortSignal): Promise<World> {
  const body = await getAuthorized(`/api/worlds/${encodeURIComponent(worldId)}`, signal);

  return parseWorld(body);
}

export async function fetchWorldTags(signal?: AbortSignal): Promise<WorldTag[]> {
  const body = await getAuthorized('/api/tags', signal);
  if (!isRecord(body) || !Array.isArray(body.tags)) {
    throw new Error('Invalid tags response');
  }

  return body.tags.map(parseWorldTag).filter((tag): tag is WorldTag => tag !== null);
}
