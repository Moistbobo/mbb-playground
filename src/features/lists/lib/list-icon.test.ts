/// <reference types="jest" />

import {
  DEFAULT_LIST_ICON_SYMBOL,
  LIST_ICON_NAMES,
  resolveListIcon,
} from '@/features/lists/lib/list-icon';

describe('resolveListIcon', () => {
  it('maps a known Lucide name to expo-symbols', () => {
    expect(resolveListIcon('Heart')).toEqual({
      kind: 'symbol',
      name: { ios: 'heart.fill', android: 'favorite' },
    });
  });

  it('renders an unknown non-empty value as emoji text', () => {
    expect(resolveListIcon('🌙')).toEqual({ kind: 'emoji', value: '🌙' });
  });

  it('falls back to the default star for null and blank values', () => {
    expect(resolveListIcon(null)).toEqual({ kind: 'symbol', name: DEFAULT_LIST_ICON_SYMBOL });
    expect(resolveListIcon('   ')).toEqual({ kind: 'symbol', name: DEFAULT_LIST_ICON_SYMBOL });
  });

  it('exposes every mapped Lucide name', () => {
    expect(LIST_ICON_NAMES.sort()).toEqual(
      [
        'Briefcase',
        'Camera',
        'Coffee',
        'Gamepad2',
        'Heart',
        'Home',
        'Moon',
        'Music',
        'PartyPopper',
        'Plane',
        'Star',
      ].sort(),
    );
  });
});
