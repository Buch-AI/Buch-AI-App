import { Stack } from 'expo-router/stack';

// Define auth route type
type AuthStackParamList = {
  login: undefined;
  'sign-up': undefined;
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Welcome',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
}
