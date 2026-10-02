import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { Asteroid } from './components/Asteroid';
import { GameOverOverlay } from './components/GameOverOverlay';
import { Ship } from './components/Ship';
import { POOL_SIZE } from './constants';
import { useDodgeGame } from './hooks/useDodgeGame';

export function AsteroidGame() {
  const { world, status, panGesture, onLayout, onRestart } = useDodgeGame();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <GestureDetector gesture={panGesture}>
        <View onLayout={onLayout} style={styles.playfield}>
          <Ship world={world} />
          {Array.from({ length: POOL_SIZE }, (_, index) => (
            <Asteroid key={index} world={world} slot={index} />
          ))}
          <Text style={styles.hint}>Drag horizontally to dodge</Text>
        </View>
      </GestureDetector>
      {status === 'over' ? <GameOverOverlay onRestart={onRestart} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  playfield: {
    flex: 1,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    top: Spacing.four,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});
