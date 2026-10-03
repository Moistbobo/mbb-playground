export interface WorldList {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  worldIds: string[];
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListInput {
  name: string;
  icon?: string | null;
  color?: string;
  memo?: string | null;
}

export type AddWorldResult =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'not-found' | 'already-added' };

export type CreateListResult = { ok: true; list: WorldList };

export type ImportResult = { ok: true };
