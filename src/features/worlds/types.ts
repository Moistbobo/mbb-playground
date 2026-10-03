export type WorldQuality = 'good' | 'bad' | null;

export interface World {
  worldId: string;
  name: string;
  authorName: string;
  capacity: number;
  platforms: string[];
  tags: string[];
  flags?: string[];
  imageUrl: string;
  vrchatUrl: string;
  quality: WorldQuality;
  highPriority?: boolean;
  guildId?: string;
  createdAt: string;
  internalAddDate?: string;
}

export interface WorldTag {
  tag: string;
  emoji: string;
  hexColor: string;
}

export interface PaginatedWorlds {
  total: number;
  limit: number;
  offset: number;
  worlds: World[];
}

export interface WorldsQuery {
  limit: number;
  offset: number;
  minCapacity?: number;
  maxCapacity?: number;
  search?: string;
  order?: 'asc' | 'desc';
}
