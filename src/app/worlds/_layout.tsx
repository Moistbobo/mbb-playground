import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { ListsProvider } from '@/features/lists';

const queryClient = new QueryClient();

export default function WorldsLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ListsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="[worldId]" options={{ animation: 'fade' }} />
        </Stack>
      </ListsProvider>
    </QueryClientProvider>
  );
}
