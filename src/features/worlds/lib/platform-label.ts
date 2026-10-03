const PLATFORM_LABELS: Record<string, string> = {
  standalonewindows: 'Desktop',
  android: 'Android',
  ios: 'iOS',
  web: 'web',
};

export function getPlatformLabel(platform: string): string {
  if (platform === '') {
    return 'Unknown';
  }
  return PLATFORM_LABELS[platform] ?? platform;
}
