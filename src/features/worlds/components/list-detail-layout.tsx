import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import {
  DETAIL_PANE_FLEX,
  LIST_PANE_FLEX,
  PANE_DIVIDER_WIDTH,
} from '@/features/worlds/lib/list-layout';

interface ListDetailLayoutProps {
  enabled: boolean;
  list: ReactNode;
  detail: ReactNode;
  listExtent?: number;
}

export function ListDetailLayout({ enabled, list, detail, listExtent }: ListDetailLayoutProps) {
  const listPaneStyle = enabled && listExtent != null ? { flex: 0, width: listExtent } : undefined;

  return (
    <View style={[styles.root, enabled ? styles.row : styles.column]}>
      <View style={[styles.listPane, listPaneStyle]}>{list}</View>
      {enabled ? (
        <>
          <View style={styles.divider} />
          <View style={styles.detailPane}>{detail}</View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  listPane: {
    flex: LIST_PANE_FLEX,
    minWidth: 0,
  },
  divider: {
    width: PANE_DIVIDER_WIDTH,
    backgroundColor: theme.colors.border,
  },
  detailPane: {
    flex: DETAIL_PANE_FLEX,
    minWidth: 0,
  },
}));
