import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { registerUser } from '@/services/DatabaseAdapter';
import Logger from '@/utils/Logger';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in all fields.');
      setModalVisible(true);
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
        setErrorMessage(error.message || 'An error occurred during sign up.');
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Passwords do not match.');
      setModalVisible(true);
    }
  };

  const illustrationSize = RFValue(160); // Base size for a 680px screen height

  return (
    <SafeAreaScrollView className="bg-gray-100">
      <ThemedView className="min-h-screen flex-1 items-center justify-center p-6">
        <View pointerEvents="none">
          <Image
            source={require('@/assets/images/illustration-sample-1.png')}
            style={{
              width: illustrationSize,
              height: illustrationSize * 0.75,
              resizeMode: 'contain',
              marginBottom: RFValue(20),
            }}
            accessible={false}
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
          <Pressable>
            <ThemedText className="mt-4 text-blue-600">
              Already have an account? Log in.
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Error"
        message={errorMessage}
      />
    </SafeAreaScrollView>
  );
}
