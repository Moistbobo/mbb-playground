import { StyleSheet } from 'react-native-unistyles';

import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

const spacing = {
  ...Spacing,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

const lightTheme = {
  colors: Colors.light,
  fonts: Fonts,
  spacing,
  radius: Radius,
  typography: Typography,
} as const;

const darkTheme = {
  colors: Colors.dark,
  fonts: Fonts,
  spacing,
  radius: Radius,
  typography: Typography,
} as const;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: typeof lightTheme;
    dark: typeof darkTheme;
  }
  export interface UnistylesBreakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
});
