/// <reference types="jest" />

import { Colors, Spacing } from '@/constants/theme';

describe('theme', () => {
  it('defines the same color keys for light and dark', () => {
    expect(Object.keys(Colors.light).sort()).toEqual(Object.keys(Colors.dark).sort());
  });

  it('uses valid hex colors', () => {
    for (const palette of [Colors.light, Colors.dark]) {
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it('orders spacing tokens ascending', () => {
    const values = [Spacing.half, Spacing.one, Spacing.two, Spacing.three, Spacing.four, Spacing.five, Spacing.six];
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });
});
