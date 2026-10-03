const WSRV_BASE = 'https://wsrv.nl/';

export function createWSRVUrl(imageUrl: string, width: number, quality = 80): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return imageUrl;
  }
  const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(absolute)) {
    return imageUrl;
  }
  const query = [
    `url=${encodeURIComponent(absolute)}`,
    `w=${encodeURIComponent(String(width))}`,
    'output=webp',
    `q=${encodeURIComponent(String(quality))}`,
  ].join('&');
  return `${WSRV_BASE}?${query}`;
}
