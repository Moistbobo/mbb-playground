import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Spacing } from '@/constants/theme';
import { useDevicePosture } from '@/features/worlds/hooks/use-device-posture';
import type { AdaptiveLayout } from '@/features/worlds/hooks/use-adaptive-layout';

interface FoldDebugPanelProps {
  visible: boolean;
  onClose: () => void;
  layout: AdaptiveLayout;
}

const HUD_TEXT = '#F2F4F7';
const HUD_TEXT_MUTED = 'rgba(242, 244, 247, 0.68)';
const HUD_BACKGROUND = 'rgba(17, 19, 24, 0.72)';
const HUD_BORDER = 'rgba(255, 255, 255, 0.16)';
const SCREEN_MARGIN = 8;

export function FoldDebugPanel({ visible, onClose, layout }: FoldDebugPanelProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const { posture, hinge, layoutInfo, hingeAngle, supportedPostures } = useDevicePosture();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const hudBox = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const viewport = useSharedValue({ width: viewportWidth, height: viewportHeight });

  useEffect(() => {
    viewport.value = { width: viewportWidth, height: viewportHeight };
  }, [viewport, viewportWidth, viewportHeight]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const box = hudBox.value;
      const minX = SCREEN_MARGIN - box.x;
      const maxX = Math.max(minX, viewport.value.width - SCREEN_MARGIN - box.x - box.width);
      const minY = SCREEN_MARGIN - box.y;
      const maxY = Math.max(minY, viewport.value.height - SCREEN_MARGIN - box.y - box.height);
      const nextX = startX.value + event.translationX;
      const nextY = startY.value + event.translationY;
      translateX.value = Math.min(Math.max(nextX, minX), maxX);
      translateY.value = Math.min(Math.max(nextY, minY), maxY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const none = t('worlds.debug.none');
  const rows: { label: string; value: string }[] = [
    { label: t('worlds.debug.presentationMode'), value: posture },
    { label: t('worlds.debug.foldState'), value: layoutInfo.state },
    { label: t('worlds.debug.orientation'), value: layoutInfo.orientation },
    { label: t('worlds.debug.occlusion'), value: layoutInfo.occlusionType },
    { label: t('worlds.debug.separating'), value: String(layoutInfo.isSeparating) },
    { label: t('worlds.debug.foldSupported'), value: String(layoutInfo.isFoldSupported) },
    {
      label: t('worlds.debug.hingeAngle'),
      value:
        hingeAngle.supported && hingeAngle.angle != null
          ? `${Math.round(hingeAngle.angle)}°`
          : t('worlds.debug.unsupported'),
    },
    {
      label: t('worlds.debug.hingeCenter'),
      value: hinge ? `${hinge.orientation} ${Math.round(hinge.center)}` : none,
    },
    {
      label: t('worlds.debug.bounds'),
      value: layoutInfo.bounds
        ? `${layoutInfo.bounds.left}, ${layoutInfo.bounds.top}, ${layoutInfo.bounds.right}, ${layoutInfo.bounds.bottom}`
        : none,
    },
    {
      label: t('worlds.debug.supportedPostures'),
      value: supportedPostures.length > 0 ? supportedPostures.join(', ') : none,
    },
    { label: t('worlds.debug.displayFeatures'), value: String(layoutInfo.displayFeatures.length) },
    { label: t('worlds.debug.sizeClass'), value: layout.sizeClass },
    { label: t('worlds.debug.paneLayout'), value: layout.paneLayout },
    { label: t('worlds.debug.navigationMode'), value: layout.navigationMode },
    { label: t('worlds.debug.listColumns'), value: String(layout.listColumns) },
    {
      label: t('worlds.debug.listExtent'),
      value: layout.listExtent != null ? String(Math.round(layout.listExtent)) : none,
    },
    { label: t('worlds.debug.width'), value: String(Math.round(layout.width)) },
  ];

  return (
    <View pointerEvents="box-none" style={styles.fill}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.hud, { bottom: insets.bottom + Spacing.four }, animatedStyle]}
          onLayout={(event) => {
            hudBox.value = event.nativeEvent.layout;
          }}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('worlds.debug.title')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.debug.close')}
              onPress={onClose}
              hitSlop={8}
              style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close' }} size={14} tintColor={HUD_TEXT} />
            </Pressable>
          </View>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hud: {
    position: 'absolute',
    right: Spacing.three,
    minWidth: 196,
    maxWidth: 260,
    padding: Spacing.two,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: HUD_BORDER,
    backgroundColor: HUD_BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  title: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: HUD_TEXT,
  },
  closeButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: 1,
  },
  label: {
    ...theme.typography.caption,
    fontSize: 11,
    color: HUD_TEXT_MUTED,
  },
  value: {
    ...theme.typography.mono,
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    flexShrink: 1,
    textAlign: 'right',
    color: HUD_TEXT,
  },
}));
