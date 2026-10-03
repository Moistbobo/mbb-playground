import type { SymbolViewProps } from 'expo-symbols';

export const DEFAULT_LIST_ICON_SYMBOL: SymbolViewProps['name'] = {
  ios: 'star.fill',
  android: 'star',
};

export const LIST_ICON_SYMBOLS: Record<string, SymbolViewProps['name']> = {
  Star: DEFAULT_LIST_ICON_SYMBOL,
  Heart: { ios: 'heart.fill', android: 'favorite' },
  Music: { ios: 'music.note', android: 'music_note' },
  Moon: { ios: 'moon.fill', android: 'dark_mode' },
  PartyPopper: { ios: 'party.popper.fill', android: 'celebration' },
  Gamepad2: { ios: 'gamecontroller.fill', android: 'sports_esports' },
  Briefcase: { ios: 'briefcase.fill', android: 'work' },
  Home: { ios: 'house.fill', android: 'home' },
  Plane: { ios: 'airplane', android: 'flight' },
  Camera: { ios: 'camera.fill', android: 'photo_camera' },
  Coffee: { ios: 'cup.and.saucer.fill', android: 'local_cafe' },
};

export const LIST_ICON_NAMES = Object.keys(LIST_ICON_SYMBOLS);

export type ResolvedListIcon =
  | { kind: 'symbol'; name: SymbolViewProps['name'] }
  | { kind: 'emoji'; value: string };

export function resolveListIcon(icon: string | null): ResolvedListIcon {
  const trimmed = icon?.trim() ?? '';
  if (!trimmed) {
    return { kind: 'symbol', name: DEFAULT_LIST_ICON_SYMBOL };
  }
  const symbol = LIST_ICON_SYMBOLS[trimmed];
  if (symbol) {
    return { kind: 'symbol', name: symbol };
  }
  return { kind: 'emoji', value: trimmed };
}
