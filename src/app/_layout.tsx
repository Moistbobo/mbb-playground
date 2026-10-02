import { Observe, ObserveRoot } from 'expo-observe';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';

import '@/i18n';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useDeviceLocaleFallback } from '@/i18n/use-language';

Observe.configure({
  integrations: { 'expo-router': true },
});

SplashScreen.preventAutoHideAsync();

function TabLayout() {
  const colorScheme = useColorScheme();
  useDeviceLocaleFallback();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
      <Toast />
    </ThemeProvider>
  );
}

export default ObserveRoot.wrap(TabLayout);
