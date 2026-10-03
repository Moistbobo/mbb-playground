/// <reference types="jest" />

import {
  getWindowSizeClass,
  normalizeSizeClass,
  resolveAdaptiveLayout,
} from '@/features/worlds/lib/window-size';

describe('getWindowSizeClass', () => {
  it.each([
    [599, 'compact'],
    [600, 'medium'],
    [839, 'medium'],
    [840, 'expanded'],
  ] as const)('classifies width %i as %s', (width, expected) => {
    expect(getWindowSizeClass(width)).toBe(expected);
  });

  it('treats a zero width as compact', () => {
    expect(getWindowSizeClass(0)).toBe('compact');
  });
});

describe('normalizeSizeClass', () => {
  it('maps the Android size class values to the layout union', () => {
    expect(normalizeSizeClass('COMPACT')).toBe('compact');
    expect(normalizeSizeClass('MEDIUM')).toBe('medium');
    expect(normalizeSizeClass('EXPANDED')).toBe('expanded');
  });

  it('returns null for absent or unknown values', () => {
    expect(normalizeSizeClass(null)).toBeNull();
    expect(normalizeSizeClass(undefined)).toBeNull();
    expect(normalizeSizeClass('')).toBeNull();
    expect(normalizeSizeClass('HUGE')).toBeNull();
  });
});

describe('resolveAdaptiveLayout', () => {
  it('maps the width size class to a navigation mode', () => {
    expect(resolveAdaptiveLayout({ width: 599 }).navigationMode).toBe('bottom-tabs');
    expect(resolveAdaptiveLayout({ width: 600 }).navigationMode).toBe('navigation-rail');
    expect(resolveAdaptiveLayout({ width: 840 }).navigationMode).toBe('navigation-rail');
  });

  it('splits on width alone, with no height gate', () => {
    expect(resolveAdaptiveLayout({ width: 599 }).paneLayout).toBe('single');
    expect(resolveAdaptiveLayout({ width: 600 }).paneLayout).toBe('list-detail');
    expect(resolveAdaptiveLayout({ width: 840 }).paneLayout).toBe('list-detail');
  });

  it('prefers the native size class over the width fallback', () => {
    expect(resolveAdaptiveLayout({ width: 400, nativeSizeClass: 'EXPANDED' })).toMatchObject({
      sizeClass: 'expanded',
      paneLayout: 'list-detail',
    });
    expect(resolveAdaptiveLayout({ width: 1000, nativeSizeClass: 'COMPACT' })).toMatchObject({
      sizeClass: 'compact',
      paneLayout: 'single',
    });
  });

  it('falls back to the width when the native class is unknown', () => {
    expect(resolveAdaptiveLayout({ width: 700, nativeSizeClass: 'HUGE' }).sizeClass).toBe('medium');
  });

  it('derives list columns from the analytic list pane width', () => {
    expect(resolveAdaptiveLayout({ width: 840 }).listColumns).toBe(2);
    expect(resolveAdaptiveLayout({ width: 1200 }).listColumns).toBe(3);
    expect(resolveAdaptiveLayout({ width: 1600 }).listColumns).toBe(4);
  });

  it('keeps one column in the single-pane layout', () => {
    expect(resolveAdaptiveLayout({ width: 320 }).listColumns).toBe(1);
    expect(resolveAdaptiveLayout({ width: 599 }).listColumns).toBe(1);
  });

  it('echoes the width and size class', () => {
    expect(resolveAdaptiveLayout({ width: 700 })).toMatchObject({ width: 700, sizeClass: 'medium' });
  });
});
