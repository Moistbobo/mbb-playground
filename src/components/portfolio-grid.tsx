import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { PortfolioTile } from '@/components/portfolio-tile';
import type { PortfolioItem } from '@/constants/portfolio';
import { PORTFOLIO_ITEMS, TILE_COLUMNS } from '@/constants/portfolio';
import { Spacing } from '@/constants/theme';

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

export function PortfolioGrid({ onPressItem }: { onPressItem: (item: PortfolioItem) => void }) {
  const rows = chunk(PORTFOLIO_ITEMS, TILE_COLUMNS);

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.map((item) => item.id).join('-')} style={styles.row}>
          {row.map((item) => (
            <View key={item.id} style={styles.cell}>
              <PortfolioTile item={item} onPress={onPressItem} />
            </View>
          ))}
          {Array.from({ length: TILE_COLUMNS - row.length }).map((_, index) => (
            <View key={`spacer-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  cell: {
    flex: 1,
  },
});
