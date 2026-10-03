/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#60646C',
    textMuted: '#585F6B',
    textSubtle: '#626976',
    background: '#ffffff',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#ECEEF3',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    border: '#E1E4EA',
    borderStrong: '#C7CCD6',
    primary: '#3B5BDB',
    onPrimary: '#FFFFFF',
    primaryMuted: '#E6EAFB',
    accent: '#0F766E',
    success: '#0F7B4F',
    warning: '#B45309',
    danger: '#C0392B',
    focusRing: '#3B5BDB',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#B0B4BA',
    textMuted: '#A3AAB6',
    textSubtle: '#8A929F',
    background: '#000000',
    surface: '#131519',
    surfaceElevated: '#1A1D23',
    surfaceMuted: '#1F232A',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    border: '#252A33',
    borderStrong: '#3A414D',
    primary: '#93A8FF',
    onPrimary: '#0A1024',
    primaryMuted: '#1B2440',
    accent: '#3BD9AE',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
    focusRing: '#93A8FF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const Typography = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '700' },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  mono: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;
