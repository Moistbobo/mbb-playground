import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function GameOverOverlay({ onRestart }: { onRestart: () => void }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.body}>You hit an asteroid.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restart"
          onPress={onRestart}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonLabel}>Restart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    backgroundColor: Colors.dark.backgroundElement,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  body: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: '#3C87F7',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
