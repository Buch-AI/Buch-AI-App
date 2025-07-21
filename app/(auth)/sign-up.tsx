import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser } from '@/services/DatabaseAdapter';
import Logger from '@/utils/Logger';

export default function SignUpScreen() {
  const { setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password === confirmPassword) {
      setLoading(true);
      try {
        const userData = {
          user_id: email,
          username: email,
          email,
          password,
        };
        await registerUser(userData);
        Logger.info('Sign-up successful!');
        router.replace('/(auth)/login');
      } catch (error: any) {
        Logger.error(`Sign-up failed: ${error}`);
        setError(error.message || 'An error occurred during sign up.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Passwords do not match.');
    }
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1 p-6">
        <SafeAreaScrollView>
          <View style={{ pointerEvents: 'none' }} className="w-full items-center">
            <ThemedImage
              source={require('../../assets/images/illustration-sample-1@2000.png')}
              rfSize={160}
            />
          </View>
          <ThemedText type="title" className="mb-6 font-bold">Sign Up</ThemedText>
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
          <ThemedTextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="mb-4 w-full"
          />
          <ThemedButton title="Sign Up" onPress={handleSignUp} loading={loading} />
          <Link href="/(auth)/login" asChild>
            <ThemedButton
              title="Already have an account? Log in."
              onPress={() => {}}
              variant="text"
              className="mt-2"
            />
          </Link>
          {/* Privacy Policy and Terms of Service Agreement */}
          <View className="mb-2 mt-4">
            <ThemedText className="text-center text-sm text-gray-400 dark:text-gray-600">
              By signing up, you agree to our{' '}
              <Pressable onPress={() => router.push('/legal/terms-of-service' as any)}>
                <ThemedText className="text-center text-sm text-gray-400 underline dark:text-gray-600">
                  Terms of Service
                </ThemedText>
              </Pressable>
              {' '}and{' '}
              <Pressable onPress={() => router.push('/legal/privacy-policy' as any)}>
                <ThemedText className="text-center text-sm text-gray-400 underline dark:text-gray-600">
                  Privacy Policy
                </ThemedText>
              </Pressable>
              .
            </ThemedText>
          </View>
          <View className="h-10" />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
