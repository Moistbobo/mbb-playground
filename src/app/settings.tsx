import { Picker } from '@expo/ui/community/picker';
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/i18n/language';
import { useLanguage } from '@/i18n/use-language';

export default function SettingsScreen() {
  const { markInteractive } = useObserve();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={[styles.safeArea, Platform.select({ web: { paddingTop: Spacing.six } })]}>
        <ThemedText type="subtitle">{t('settings.title')}</ThemedText>
        <ThemedView type="backgroundElement" style={styles.languagePicker}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('settings.language')}
          </ThemedText>
          <Picker
            selectedValue={language}
            onValueChange={(value) => setLanguage(value)}
            style={styles.picker}>
            {SUPPORTED_LANGUAGES.map((supported) => (
              <Picker.Item
                key={supported}
                label={LANGUAGE_LABELS[supported]}
                value={supported}
                color={theme.text}
              />
            ))}
          </Picker>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  languagePicker: {
    alignSelf: 'stretch',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  picker: {
    alignSelf: 'stretch',
  },
});
