import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { useAuth } from '@/contexts/AuthContext';
import Logger from '@/utils/Logger';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // NOTE: Perform login - AuthContext will keep isLoading true during the transition
      // NOTE: _layout.tsx will handle navigation and setting isLoading to false
      await login(email, password);

      // NOTE: We don't set loading to false on success because
      // NOTE: AuthContext keeps isLoading true during navigation
    } catch (error: any) {
      Logger.error(`Login failed: ${error}`);

      // NOTE: Only terminate the local loading state, not the AuthContext loading state
      // NOTE: The error modal is automatically shown by AuthProvider
      setIsLoading(false);
    }
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1 p-6">
        <SafeAreaScrollView>
          <View pointerEvents="none" className="w-full items-center">
            <ThemedImage
              source={require('@/assets/images/illustration-sample-1@2000.png')}
              rfSize={160}
            />
          </View>
          <ThemedText type="title" className="mb-6 font-bold">Log In</ThemedText>
          <ThemedTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            className="mb-4 w-full"
          />
          <ThemedTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mb-4 w-full"
          />
          <ThemedButton title="Log In" onPress={handleLogin} loading={isLoading} />
          <Link href="/(auth)/sign-up" asChild>
            <ThemedButton
              title="Don't have an account? Sign up."
              onPress={() => {}}
              variant="text"
              className="mt-2"
            />
          </Link>
          <View className="h-10" />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
