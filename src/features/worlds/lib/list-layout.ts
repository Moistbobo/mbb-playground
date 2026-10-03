import { Spacing } from '@/constants/theme';

export const MIN_CARD_WIDTH = 160;
// The list pane inside a split is roughly half the device, so it packs narrower
// cards than a full-width single pane, which lets an unfolded device show two
// worlds side by side on each half.
export const LIST_DETAIL_MIN_CARD_WIDTH = 128;

export const LIST_PANE_FLEX = 1;
export const DETAIL_PANE_FLEX = 1.2;
export const PANE_DIVIDER_WIDTH = 1;

export const LIST_CONTENT_PADDING_H = Spacing.three - Spacing.one;
export const CARD_MARGIN_H = Spacing.one;

export function analyticListPaneWidth(windowWidth: number, railWidth: number): number {
  const available = windowWidth - railWidth - PANE_DIVIDER_WIDTH;
  return Math.max(available, 0) * (LIST_PANE_FLEX / (LIST_PANE_FLEX + DETAIL_PANE_FLEX));
}

export function columnCountForPaneWidth(
  paneWidth: number,
  minCardWidth: number = MIN_CARD_WIDTH,
): number {
  if (!Number.isFinite(paneWidth) || paneWidth <= 0) {
    return 1;
  }
  const usable = paneWidth - 2 * LIST_CONTENT_PADDING_H;
  const perColumn = minCardWidth + 2 * CARD_MARGIN_H;
  return Math.max(1, Math.floor(usable / perColumn));
}
