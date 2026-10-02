import type { ImageSourcePropType } from 'react-native';

export type PortfolioItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

export const APP_TITLE = 'mbb-playground';
export const AVATAR_URL = 'https://avatars.githubusercontent.com/u/29080587?v=4';
export const TILE_COLUMNS = 3;

export const PORTFOLIO_ITEMS: readonly PortfolioItem[] = [
  { id: 'live-weather', name: 'Live Weather', image: require('@/assets/images/react-logo.png') },
  { id: 'barcode-scanner', name: 'Barcode Scanner', image: require('@/assets/images/expo-logo.png') },
  { id: 'animated-charts', name: 'Animated Charts', image: require('@/assets/images/expo-badge.png') },
  { id: 'offline-notes', name: 'Offline Notes', image: require('@/assets/images/splash-icon.png') },
  { id: 'camera-filters', name: 'Camera Filters', image: require('@/assets/images/logo-glow.png') },
];
