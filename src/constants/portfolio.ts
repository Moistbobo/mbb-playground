import type { ImageSourcePropType } from 'react-native';

export type PortfolioItem = {
  id: string;
  nameKey: string;
  image: ImageSourcePropType;
};

export const APP_TITLE = 'mbb-playground';
export const AVATAR_URL = 'https://avatars.githubusercontent.com/u/29080587?v=4';
export const TILE_COLUMNS = 3;

export const PORTFOLIO_ITEMS: readonly PortfolioItem[] = [
  { id: 'dodge-objects', nameKey: 'game.name', image: require('@/assets/images/expo-badge.png') },
];
