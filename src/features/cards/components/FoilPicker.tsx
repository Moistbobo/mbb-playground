import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { PATTERNS, type CardPattern } from '../constants';
import { StrengthSlider } from './StrengthSlider';

type FoilPickerProps = {
  pattern: CardPattern;
  onPatternChange: (pattern: CardPattern) => void;
  rainbow: number;
  onRainbowChange: (value: number) => void;
  glare: number;
  onGlareChange: (value: number) => void;
  glitter: number;
  onGlitterChange: (value: number) => void;
};

export function FoilPicker({
  pattern,
  onPatternChange,
  rainbow,
  onRainbowChange,
  glare,
  onGlareChange,
  glitter,
  onGlitterChange,
}: FoilPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <Text style={styles.section}>{t('cards.patterns.label')}</Text>
      <View style={styles.chips}>
        {PATTERNS.map((name, index) => {
          const selected = pattern === index;
          return (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={t('cards.a11y.pattern', { pattern: t(`cards.patterns.${name}`) })}
              accessibilityState={{ selected }}
              onPress={() => onPatternChange(index as CardPattern)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {t(`cards.patterns.${name}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <StrengthSlider
        label={t('cards.strength.rainbow')}
        value={rainbow}
        onChange={onRainbowChange}
      />
      <StrengthSlider label={t('cards.strength.glare')} value={glare} onChange={onGlareChange} />
      <StrengthSlider
        label={t('cards.strength.glitter')}
        value={glitter}
        onChange={onGlitterChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing.two,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    backgroundColor: Colors.dark.surface,
  },
  chipSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primaryMuted,
  },
  chipLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
});
