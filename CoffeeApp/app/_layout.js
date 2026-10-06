import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4b2e2b' },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Campus Coffee' }} />
      <Stack.Screen name="receipt" options={{ title: 'Your Receipt' }} />
    </Stack>
  );
}