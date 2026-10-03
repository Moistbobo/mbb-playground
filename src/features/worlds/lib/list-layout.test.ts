/// <reference types="jest" />

import { Spacing } from '@/constants/theme';
import {
  CARD_MARGIN_H,
  LIST_CONTENT_PADDING_H,
  LIST_DETAIL_MIN_CARD_WIDTH,
  analyticListPaneWidth,
  columnCountForPaneWidth,
} from '@/features/worlds/lib/list-layout';
import { MIN_LIST_EXTENT } from '@/features/worlds/lib/window-size';

const RAIL_WIDTH = 88;

describe('columnCountForPaneWidth', () => {
  it.each([
    [MIN_LIST_EXTENT, 1],
    [359, 1],
    [360, 2],
    [527, 2],
    [528, 3],
  ] as const)('maps a %idp pane to %i columns', (paneWidth, columns) => {
    expect(columnCountForPaneWidth(paneWidth)).toBe(columns);
  });

  it.each([0, -5, Number.NaN])('returns one column for the degenerate width %s', (paneWidth) => {
    expect(columnCountForPaneWidth(paneWidth)).toBe(1);
  });

  it('reproduces the ticket table through the analytic pane width', () => {
    const columnsAtWindow = (windowWidth: number) =>
      columnCountForPaneWidth(analyticListPaneWidth(windowWidth, RAIL_WIDTH));
    expect([columnsAtWindow(840), columnsAtWindow(1200), columnsAtWindow(1600)]).toEqual([1, 2, 3]);
  });
});

describe('list-detail density', () => {
  it('packs two columns into a half-width unfolded pane', () => {
    expect(columnCountForPaneWidth(333, LIST_DETAIL_MIN_CARD_WIDTH)).toBe(2);
    expect(columnCountForPaneWidth(320, LIST_DETAIL_MIN_CARD_WIDTH)).toBe(2);
    expect(columnCountForPaneWidth(300, LIST_DETAIL_MIN_CARD_WIDTH)).toBe(2);
    expect(columnCountForPaneWidth(280, LIST_DETAIL_MIN_CARD_WIDTH)).toBe(1);
  });
});

describe('analyticListPaneWidth', () => {
  it('splits the post-rail, post-divider width 1 : 1.2', () => {
    expect(analyticListPaneWidth(840, RAIL_WIDTH)).toBeCloseTo(751 / 2.2);
    expect(analyticListPaneWidth(1200, RAIL_WIDTH)).toBeCloseTo(505);
    expect(analyticListPaneWidth(1600, RAIL_WIDTH)).toBeCloseTo(1511 / 2.2);
  });

  it('clamps a window narrower than the chrome to zero', () => {
    expect(analyticListPaneWidth(0, RAIL_WIDTH)).toBe(0);
  });
});

describe('grid metrics', () => {
  it('derives content insets from the shared spacing scale', () => {
    expect(LIST_CONTENT_PADDING_H).toBe(Spacing.three - Spacing.one);
    expect(CARD_MARGIN_H).toBe(Spacing.one);
  });
});
