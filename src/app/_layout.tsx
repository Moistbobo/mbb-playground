import { Observe, ObserveRoot } from 'expo-observe';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import '@/i18n';
import '@/unistyles';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FoldProvider } from '@/components/fold-provider';
import { useDeviceLocaleFallback } from '@/i18n/use-language';

Observe.configure({
  integrations: { 'expo-router': true },
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  useDeviceLocaleFallback();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <FoldProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="game" options={{ animation: 'fade' }} />
            <Stack.Screen name="worlds" />
          </Stack>
        </FoldProvider>
        <AnimatedSplashOverlay />
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default ObserveRoot.wrap(RootLayout);
