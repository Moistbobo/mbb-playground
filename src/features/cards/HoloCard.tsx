import {
  Canvas,
  Fill,
  Image as SkiaImage,
  Shader,
  useImage,
  type SkImage,
} from '@shopify/react-native-skia';
import { useIsFocused } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Colors, Radius, Spacing } from '@/constants/theme';

import {
  CARD_ASPECT,
  DEFAULT_GLARE,
  DEFAULT_GLITTER,
  DEFAULT_PATTERN,
  DEFAULT_RAINBOW,
  DRAG_RANGE_FRACTION,
  MAX_TILT_DEG,
  type CardPattern,
} from './constants';
import { getFoilEffect } from './foil.sksl';
import { AttitudeSensor } from './hooks/AttitudeSensor';
import { useCardTilt } from './hooks/useCardTilt';
import { useFoilUniforms } from './hooks/useFoilUniforms';
import { useReduceMotion } from './hooks/useReduceMotion';
import type { Vec2 } from './tilt';

const CARD_SOURCE = require('@/assets/cards/card.jpg');

/** Simulator-only tilt poses, since iOS simulators have no motion sensor. */
const DEV_TILTS: readonly Vec2[] = [
  { x: -0.8, y: 0 },
  { x: 0, y: 0.8 },
  { x: 0.8, y: 0 },
  { x: 0, y: -0.8 },
  { x: 0, y: 0 },
];

export type HoloCardProps = {
  /** Optional card face. Defaults to the bundled placeholder. */
  feather?: SkImage;
  width: number;
  pattern?: CardPattern;
  rainbow?: number;
  glare?: number;
  glitter?: number;
  onRecenter?: () => void;
};

export function HoloCard({
  feather,
  width,
  pattern = DEFAULT_PATTERN,
  rainbow = DEFAULT_RAINBOW,
  glare = DEFAULT_GLARE,
  glitter = DEFAULT_GLITTER,
  onRecenter,
}: HoloCardProps) {
  const { t } = useTranslation();
  const focused = useIsFocused();
  const reduceMotion = useReduceMotion();
  const height = width / CARD_ASPECT;
  const effect = getFoilEffect();
  const loaded = useImage(CARD_SOURCE);
  const image = feather ?? loaded;

  const { tilt, gesture, recenter, sensorAvailable, ingestSample, setTiltOverride } = useCardTilt({
    dragRange: width * DRAG_RANGE_FRACTION,
    reduceMotion,
  });

  const { overlay, screen } = useFoilUniforms({
    width,
    height,
    tilt,
    pattern,
    rainbow,
    glare,
    glitter,
    animate: focused && !reduceMotion,
  });

  // Tilt follows the raised edge, matching the uLight convention in the shader.
  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${tilt.value.y * MAX_TILT_DEG}deg` },
      { rotateY: `${-tilt.value.x * MAX_TILT_DEG}deg` },
    ],
  }));

  const handleRecenter = useCallback(() => {
    recenter();
    onRecenter?.();
  }, [onRecenter, recenter]);

  const [devPose, setDevPose] = useState(0);
  const handleDevTilt = useCallback(() => {
    const next = (devPose + 1) % DEV_TILTS.length;
    setDevPose(next);
    setTiltOverride(DEV_TILTS[next]);
  }, [devPose, setTiltOverride]);

  return (
    <View style={styles.root}>
      {focused ? <AttitudeSensor onSample={ingestSample} /> : null}
      <GestureDetector gesture={gesture}>
        <Animated.View
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('cards.a11y.card')}
          accessibilityHint={t('cards.a11y.cardHint')}
          accessibilityActions={[{ name: 'activate', label: t('cards.recenter') }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'activate') {
              handleRecenter();
            }
          }}
          style={[styles.card, { width, height }, tiltStyle]}>
          <Canvas style={{ width, height }}>
            {image === null ? null : (
              <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="cover" />
            )}
            {effect === null ? null : (
              <>
                <Fill blendMode="overlay">
                  <Shader source={effect} uniforms={overlay} />
                </Fill>
                <Fill blendMode="screen">
                  <Shader source={effect} uniforms={screen} />
                </Fill>
              </>
            )}
          </Canvas>
        </Animated.View>
      </GestureDetector>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('cards.recenter')}
          accessibilityHint={
            sensorAvailable ? t('cards.a11y.recenterHint') : t('cards.sensorUnavailable')
          }
          accessibilityState={{ disabled: !sensorAvailable }}
          disabled={!sensorAvailable}
          onPress={handleRecenter}
          style={({ pressed }) => [
            styles.recenter,
            !sensorAvailable && styles.recenterDisabled,
            pressed && sensorAvailable && styles.recenterPressed,
          ]}>
          <Text style={styles.recenterLabel}>{t('cards.recenter')}</Text>
        </Pressable>
        <Text style={styles.status}>
          {sensorAvailable ? t('cards.hint') : t('cards.sensorUnavailable')}
        </Text>
        {__DEV__ ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDevTilt}
            style={styles.devButton}>
            <Text style={styles.devLabel}>{t('cards.dev.nextTilt')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  controls: {
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
  },
  recenter: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  recenterPressed: {
    backgroundColor: Colors.dark.backgroundSelected,
  },
  recenterDisabled: {
    opacity: 0.4,
  },
  recenterLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600',
  },
  status: {
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.dark.textSecondary,
  },
  devButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  devLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
});
