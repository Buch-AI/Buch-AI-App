import { Stack } from 'expo-router/stack';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="notification-preferences" />
      <Stack.Screen name="privacy-settings" />
    </Stack>
  );
}
