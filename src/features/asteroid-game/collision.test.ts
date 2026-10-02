/// <reference types="jest" />

import { rectsOverlap } from '@/features/asteroid-game/collision';

const base = { x: 0, y: 0, width: 10, height: 10 };

describe('rectsOverlap', () => {
  it('returns true when rectangles overlap', () => {
    expect(rectsOverlap(base, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });

  it('returns false when separated on the x axis', () => {
    expect(rectsOverlap(base, { x: 20, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it('returns false when separated on the y axis', () => {
    expect(rectsOverlap(base, { x: 0, y: 20, width: 10, height: 10 })).toBe(false);
  });

  it('returns false when edges touch', () => {
    expect(rectsOverlap(base, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it('returns true when one rectangle is nested inside the other', () => {
    expect(rectsOverlap(base, { x: 2, y: 2, width: 4, height: 4 })).toBe(true);
  });

  it('returns false when a rectangle has zero size', () => {
    expect(rectsOverlap(base, { x: 2, y: 2, width: 0, height: 0 })).toBe(false);
  });
});
