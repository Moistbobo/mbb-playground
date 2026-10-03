/// <reference types="jest" />

import {
  buildImportPreview,
  makeExportFilename,
  mergeListsById,
  parseLists,
  serializeLists,
  slugifyListName,
} from '@/features/lists/lib/lists-import-export';
import type { WorldList } from '@/features/lists/types';

const sampleList: WorldList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: ['wrld_1'],
  memo: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('serializeLists', () => {
  it('produces a versioned JSON snapshot', () => {
    const parsed = JSON.parse(serializeLists([sampleList]));
    expect(parsed.version).toBe(1);
    expect(parsed.lists).toEqual([sampleList]);
    expect(typeof parsed.exportedAt).toBe('string');
  });
});

describe('makeExportFilename', () => {
  it('uses the sosd-name-timestamp pattern', () => {
    expect(makeExportFilename('all-lists', 1751116800000)).toBe(
      'sosd-all-lists-1751116800000.json',
    );
  });

  it('slugifies names with spaces and special characters', () => {
    expect(makeExportFilename('My Favorites!', 1)).toBe('sosd-my-favorites-1.json');
    expect(slugifyListName('  A B  ')).toBe('a-b');
  });
});

describe('parseLists', () => {
  it('parses a valid snapshot', () => {
    const result = parseLists(serializeLists([sampleList]));
    expect(result.error).toBeNull();
    expect(result.exportData?.lists).toEqual([sampleList]);
  });

  it('rejects invalid JSON', () => {
    expect(parseLists('{nope')).toEqual({ exportData: null, error: 'invalidJson' });
  });

  it('rejects missing version or lists', () => {
    expect(parseLists('{}')).toEqual({ exportData: null, error: 'missingVersionOrLists' });
    expect(parseLists('{"version":1}')).toEqual({
      exportData: null,
      error: 'missingVersionOrLists',
    });
  });

  it('rejects an unsupported schema version', () => {
    expect(parseLists('{"version":99,"lists":[]}')).toEqual({
      exportData: null,
      error: 'unsupportedSchemaVersion',
    });
  });

  it('rejects when no list survives validation', () => {
    expect(parseLists('{"version":1,"lists":[{"id":"","name":""}]}')).toEqual({
      exportData: null,
      error: 'noValidLists',
    });
  });

  it('rejects a file over the size limit', () => {
    expect(parseLists('x'.repeat(10), 4)).toEqual({ exportData: null, error: 'fileTooLarge' });
  });
});

describe('buildImportPreview', () => {
  it('counts new, updated, and unchanged lists', () => {
    const incoming: WorldList[] = [sampleList, { ...sampleList, id: 'l2', name: 'Second' }];
    const preview = buildImportPreview([sampleList], incoming);
    expect(preview.newCount).toBe(1);
    expect(preview.updatedCount).toBe(1);
    expect(preview.unchangedCount).toBe(0);
    expect(preview.totalWorlds).toBe(2);
    expect(preview.items.map((item) => item.status)).toEqual(['updated', 'new']);
  });
});

describe('mergeListsById', () => {
  it('replaces matching ids and appends new ones, preserving createdAt', () => {
    const existing: WorldList[] = [sampleList];
    const incoming: WorldList[] = [
      { ...sampleList, name: 'Renamed', createdAt: '2030-01-01T00:00:00.000Z' },
      { ...sampleList, id: 'l2', name: 'Second' },
    ];
    const merged = mergeListsById(existing, incoming);
    expect(merged).toHaveLength(2);
    expect(merged[0].name).toBe('Renamed');
    expect(merged[0].createdAt).toBe(sampleList.createdAt);
    expect(merged[1].id).toBe('l2');
  });
});
