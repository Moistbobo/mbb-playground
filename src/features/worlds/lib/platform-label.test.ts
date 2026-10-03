/// <reference types="jest" />

import { getPlatformLabel } from '@/features/worlds/lib/platform-label';

describe('getPlatformLabel', () => {
  it('maps known platforms to their label', () => {
    expect(getPlatformLabel('android')).toBe('Android');
    expect(getPlatformLabel('ios')).toBe('iOS');
    expect(getPlatformLabel('standalonewindows')).toBe('Desktop');
    expect(getPlatformLabel('web')).toBe('web');
  });

  it('returns Unknown for an empty string', () => {
    expect(getPlatformLabel('')).toBe('Unknown');
  });

  it('returns the value itself for an unknown platform', () => {
    expect(getPlatformLabel('windows')).toBe('windows');
    expect(getPlatformLabel('ANDROID')).toBe('ANDROID');
  });
});
