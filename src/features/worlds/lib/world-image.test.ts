/// <reference types="jest" />

import { createWSRVUrl } from '@/features/worlds/lib/world-image';

describe('createWSRVUrl', () => {
  it('returns the original input when empty or whitespace only', () => {
    expect(createWSRVUrl('', 300)).toBe('');
    expect(createWSRVUrl('   ', 300)).toBe('   ');
  });

  it('upgrades a protocol-relative url to https', () => {
    expect(createWSRVUrl('//host/x.png', 300)).toBe(
      `https://wsrv.nl/?url=${encodeURIComponent('https://host/x.png')}&w=300&output=webp&q=80`,
    );
  });

  it('returns non-http input unchanged', () => {
    const dataUrl = 'data:image/png;base64,AAAA';
    expect(createWSRVUrl(dataUrl, 300)).toBe(dataUrl);
    expect(createWSRVUrl('foo.png', 300)).toBe('foo.png');
  });

  it('defaults quality to 80 and honors an explicit quality', () => {
    expect(createWSRVUrl('https://a.com/a.png', 300)).toContain('q=80');
    expect(createWSRVUrl('https://a.com/a.png', 300, 55)).toContain('q=55');
  });

  it('encodes the source url', () => {
    const source = 'https://a.com/img.png?x=1&y=2';
    expect(createWSRVUrl(source, 300)).toBe(
      `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=300&output=webp&q=80`,
    );
  });

  it('builds the full transformation url', () => {
    const result = createWSRVUrl('https://example.com/a.png', 300);
    expect(result).toMatch(/^https:\/\/wsrv\.nl\/\?/);
    expect(result).toBe(
      'https://wsrv.nl/?url=https%3A%2F%2Fexample.com%2Fa.png&w=300&output=webp&q=80',
    );
  });
});
