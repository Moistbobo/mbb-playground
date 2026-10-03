import {
  LIST_DETAIL_MIN_CARD_WIDTH,
  analyticListPaneWidth,
  columnCountForPaneWidth,
} from './list-layout';

export const WINDOW_SIZE_BREAKPOINTS = {
  medium: 600,
  expanded: 840,
} as const;

export const NAVIGATION_RAIL_WIDTH = 88;
export const MIN_LIST_EXTENT = 240;

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

export type NavigationMode = 'bottom-tabs' | 'navigation-rail';

export type PaneLayout = 'single' | 'list-detail';

export interface WindowLayout {
  width: number;
  sizeClass: WindowSizeClass;
  navigationMode: NavigationMode;
  paneLayout: PaneLayout;
  listColumns: number;
}

export function getWindowSizeClass(width: number): WindowSizeClass {
  if (width >= WINDOW_SIZE_BREAKPOINTS.expanded) {
    return 'expanded';
  }
  if (width >= WINDOW_SIZE_BREAKPOINTS.medium) {
    return 'medium';
  }
  return 'compact';
}

const NATIVE_SIZE_CLASSES: Record<string, WindowSizeClass> = {
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded',
};

export function normalizeSizeClass(
  nativeSizeClass: string | null | undefined,
): WindowSizeClass | null {
  if (!nativeSizeClass) {
    return null;
  }
  return NATIVE_SIZE_CLASSES[nativeSizeClass] ?? null;
}

type LayoutVariation = Pick<WindowLayout, 'navigationMode' | 'paneLayout'>;

const LAYOUT_BY_SIZE_CLASS: Record<WindowSizeClass, LayoutVariation> = {
  compact: { navigationMode: 'bottom-tabs', paneLayout: 'single' },
  medium: { navigationMode: 'navigation-rail', paneLayout: 'list-detail' },
  expanded: { navigationMode: 'navigation-rail', paneLayout: 'list-detail' },
};

function resolveListColumns(width: number, paneLayout: PaneLayout): number {
  return paneLayout === 'list-detail'
    ? columnCountForPaneWidth(
        analyticListPaneWidth(width, NAVIGATION_RAIL_WIDTH),
        LIST_DETAIL_MIN_CARD_WIDTH,
      )
    : 1;
}

export interface AdaptiveLayoutInput {
  width: number;
  nativeSizeClass?: string | null;
}

export function resolveAdaptiveLayout({
  width,
  nativeSizeClass,
}: AdaptiveLayoutInput): WindowLayout {
  const sizeClass = normalizeSizeClass(nativeSizeClass) ?? getWindowSizeClass(width);
  const variation = LAYOUT_BY_SIZE_CLASS[sizeClass];

  return {
    width,
    sizeClass,
    ...variation,
    listColumns: resolveListColumns(width, variation.paneLayout),
  };
}
