import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { Asteroid } from './components/Asteroid';
import { GameOverlay } from './components/GameOverlay';
import { Ship } from './components/Ship';
import { POOL_SIZE } from './constants';
import { useDodgeGame, type GameStatus } from './hooks/useDodgeGame';

type OverlayState = Exclude<GameStatus, 'playing'>;

const OVERLAYS: Record<
  OverlayState,
  { title: string; actionLabel: string; body: string[] }
> = {
  idle: {
    title: 'Dodge Objects',
    actionLabel: 'Start',
    body: [
      'Drag anywhere to move your ship left and right.',
      'Survive 15 seconds to win.',
      'Touch an object and the run ends.',
    ],
  },
  over: {
    title: 'Game Over',
    actionLabel: 'Restart',
    body: ['You hit an object.'],
  },
  won: {
    title: 'You Won',
    actionLabel: 'Play Again',
    body: ['You dodged objects for 15 seconds.'],
  },
};

export function AsteroidGame() {
  const insets = useSafeAreaInsets();
  const { world, status, panGesture, onLayout, onStart } = useDodgeGame(insets.bottom);
  const overlay = status === 'playing' ? null : OVERLAYS[status];

  return (
    <View style={styles.screen}>
      <GestureDetector gesture={panGesture}>
        <View onLayout={onLayout} style={styles.playfield}>
          <Ship world={world} />
          {Array.from({ length: POOL_SIZE }, (_, index) => (
            <Asteroid key={index} world={world} slot={index} />
          ))}
          <Text style={[styles.hint, { top: insets.top + Spacing.four }]}>
            Drag horizontally to dodge
          </Text>
        </View>
      </GestureDetector>
      {overlay ? (
        <GameOverlay title={overlay.title} actionLabel={overlay.actionLabel} onAction={onStart}>
          {overlay.body.map((line) => (
            <Text key={line} style={styles.body}>
              {line}
            </Text>
          ))}
        </GameOverlay>
      ) : null}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  playfield: {
    flex: 1,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.dark.textSecondary,
  },
});
