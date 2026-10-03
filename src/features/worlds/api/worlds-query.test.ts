/// <reference types="jest" />

import {
  HttpError,
  fetchWorld,
  fetchWorldTags,
  fetchWorldsPage,
} from '@/features/worlds/api/worlds-query';
import {
  API_BASE_URL,
  API_TOKEN,
  WORLD_REQUEST_ORIGIN,
} from '@/features/worlds/api/api-config';

const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  };
}

function lastFetchCall(): [string, { headers: Record<string, string>; signal?: AbortSignal }] {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('fetch was not called');
  }
  return call as [string, { headers: Record<string, string> }];
}

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('fetchWorldsPage query string', () => {
  it('always sends limit and offset with auth and origin headers', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ worlds: [], total: 0, limit: 0, offset: 0 }));

    await fetchWorldsPage({ limit: 20, offset: 40 });

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${API_BASE_URL}/api/worlds?limit=20&offset=40`);
    expect(init.headers.Authorization).toBe(`Bearer ${API_TOKEN}`);
    expect(init.headers.Origin).toBe(WORLD_REQUEST_ORIGIN);
  });

  it('appends optional filters only when provided', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ worlds: [] }));

    await fetchWorldsPage({
      limit: 5,
      offset: 10,
      minCapacity: 8,
      maxCapacity: 64,
      search: '  cat  ',
      order: 'asc',
    });

    const [url] = lastFetchCall();
    expect(url).toBe(
      `${API_BASE_URL}/api/worlds?limit=5&offset=10&minCapacity=8&maxCapacity=64&search=cat&order=asc`,
    );
  });

  it('omits order unless ascending and skips a whitespace-only search', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ worlds: [] }));

    await fetchWorldsPage({ limit: 5, offset: 0, search: '   ', order: 'desc' });

    const [url] = lastFetchCall();
    expect(url).toBe(`${API_BASE_URL}/api/worlds?limit=5&offset=0`);
  });
});

describe('fetchWorldsPage parsing', () => {
  it('maps a valid payload including optional world fields', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        total: 2,
        limit: 20,
        offset: 0,
        worlds: [
          {
            worldId: 'w1',
            name: 'World One',
            authorName: 'Author',
            capacity: 10,
            platforms: ['pc', 3],
            tags: ['tag', null],
            imageUrl: 'img',
            vrchatUrl: 'url',
            quality: 'good',
            createdAt: '2024-01-01',
            flags: ['featured'],
            highPriority: true,
            guildId: 'g1',
            internalAddDate: '2024-02-02',
          },
          { worldId: 'w2', name: 'World Two' },
        ],
      }),
    );

    const page = await fetchWorldsPage({ limit: 20, offset: 0 });

    expect(page).toMatchObject({ total: 2, limit: 20, offset: 0 });
    expect(page.worlds).toHaveLength(2);

    const [first, second] = page.worlds;
    expect(first).toMatchObject({
      worldId: 'w1',
      name: 'World One',
      authorName: 'Author',
      capacity: 10,
      platforms: ['pc'],
      tags: ['tag'],
      imageUrl: 'img',
      vrchatUrl: 'url',
      quality: 'good',
      createdAt: '2024-01-01',
      flags: ['featured'],
      highPriority: true,
      guildId: 'g1',
      internalAddDate: '2024-02-02',
    });

    expect(second).toMatchObject({
      worldId: 'w2',
      name: 'World Two',
      authorName: '',
      capacity: 0,
      platforms: [],
      tags: [],
      imageUrl: '',
      vrchatUrl: '',
      quality: null,
      createdAt: '',
    });
    expect(second).not.toHaveProperty('flags');
    expect(second).not.toHaveProperty('highPriority');
    expect(second).not.toHaveProperty('guildId');
    expect(second).not.toHaveProperty('internalAddDate');
  });

  it('defaults missing pagination fields to zero', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ worlds: [] }));

    await expect(fetchWorldsPage({ limit: 1, offset: 0 })).resolves.toEqual({
      total: 0,
      limit: 0,
      offset: 0,
      worlds: [],
    });
  });

  it('rejects an invalid paginated response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await expect(fetchWorldsPage({ limit: 1, offset: 0 })).rejects.toThrow(
      'Invalid worlds response',
    );

    fetchMock.mockResolvedValue(jsonResponse({ worlds: 'nope' }));
    await expect(fetchWorldsPage({ limit: 1, offset: 0 })).rejects.toThrow(
      'Invalid worlds response',
    );
  });

  it('nulls an unrecognized quality', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ worlds: [{ worldId: 'w', name: 'n', quality: 'great' }] }),
    );

    const page = await fetchWorldsPage({ limit: 1, offset: 0 });
    expect(page.worlds[0].quality).toBeNull();
  });
});

describe('fetchWorld error handling', () => {
  it('throws HttpError with the status and body error string', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'not found' }, { ok: false, status: 404 }));

    await expect(fetchWorld('w1')).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      message: 'not found',
    });
    await expect(fetchWorld('w1')).rejects.toBeInstanceOf(HttpError);
  });

  it('falls back to HTTP status when the body has no error string', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));

    await expect(fetchWorld('w1')).rejects.toMatchObject({ status: 500, message: 'HTTP 500' });
  });

  it('falls back to HTTP status when the body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('invalid json');
      },
    });

    await expect(fetchWorld('w1')).rejects.toMatchObject({ status: 502, message: 'HTTP 502' });
  });

  it('rejects an invalid world payload', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ name: 'only name' }));
    await expect(fetchWorld('w1')).rejects.toThrow('Invalid world payload');

    fetchMock.mockResolvedValue(jsonResponse({ worldId: 'only id' }));
    await expect(fetchWorld('w1')).rejects.toThrow('Invalid world payload');
  });
});

describe('fetchWorldTags', () => {
  it('throws when tags is not an array', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ tags: 'nope' }));
    await expect(fetchWorldTags()).rejects.toThrow('Invalid tags response');

    fetchMock.mockResolvedValue(jsonResponse({}));
    await expect(fetchWorldTags()).rejects.toThrow('Invalid tags response');
  });

  it('drops tags without a tag and blanks an invalid hex color', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        tags: [
          { tag: 'good', emoji: 'x', hexColor: '#aAbBcC' },
          { emoji: 'x', hexColor: '#ffffff' },
          { tag: 'nohex', emoji: 'x' },
          { tag: 'short', hexColor: '#fff' },
          { tag: 'nothex', hexColor: '#GGGGGG' },
          { tag: 'trimmed', hexColor: ' #010203 ' },
          null,
          'string',
        ],
      }),
    );

    await expect(fetchWorldTags()).resolves.toEqual([
      { tag: 'good', emoji: 'x', hexColor: '#aAbBcC' },
      { tag: 'nohex', emoji: 'x', hexColor: '' },
      { tag: 'short', emoji: '', hexColor: '' },
      { tag: 'nothex', emoji: '', hexColor: '' },
      { tag: 'trimmed', emoji: '', hexColor: '#010203' },
    ]);
  });
});
