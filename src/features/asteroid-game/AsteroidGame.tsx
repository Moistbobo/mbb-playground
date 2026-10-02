import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { Asteroid } from './components/Asteroid';
import { GameOverlay } from './components/GameOverlay';
import { Ship } from './components/Ship';
import { POOL_SIZE, WIN_TIME_MS } from './constants';
import { useDodgeGame, type GameStatus } from './hooks/useDodgeGame';

type OverlayState = Exclude<GameStatus, 'playing'>;

export function AsteroidGame() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { world, status, secondsLeft, panGesture, onLayout, onStart } = useDodgeGame(insets.bottom);

  const seconds = WIN_TIME_MS / 1000;
  const overlays: Record<OverlayState, { title: string; actionLabel: string; body: string[] }> = {
    idle: {
      title: t('game.start.title'),
      actionLabel: t('game.start.action'),
      body: [t('game.start.controls'), t('game.start.win', { seconds }), t('game.start.lose')],
    },
    over: {
      title: t('game.over.title'),
      actionLabel: t('game.over.action'),
      body: [t('game.over.body')],
    },
    won: {
      title: t('game.won.title'),
      actionLabel: t('game.won.action'),
      body: [t('game.won.body', { seconds })],
    },
  };
  const overlay = status === 'playing' ? null : overlays[status];

  return (
    <View style={styles.screen}>
      <GestureDetector gesture={panGesture}>
        <View onLayout={onLayout} style={styles.playfield}>
          <Ship world={world} />
          {Array.from({ length: POOL_SIZE }, (_, index) => (
            <Asteroid key={index} world={world} slot={index} />
          ))}
          <View pointerEvents="none" style={[styles.hud, { top: insets.top + Spacing.four }]}>
            <Text style={styles.hint}>{t('game.hint')}</Text>
            <Text style={styles.timer}>{t('game.timeLeft', { seconds: secondsLeft })}</Text>
          </View>
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
  hud: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: Spacing.one,
  },
  hint: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  timer: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.dark.textSecondary,
  },
});
