import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { login } from '@/services/AuthAdapter';
import { useAuth } from '../_layout';

export default function LoginScreen() {
  const { setAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const tokenResponse = await login(email, password);
      const token = tokenResponse.access_token;

      if (token) {
        await AsyncStorage.setItem('access_token', token);
        setAuthenticated(true);
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred during sign in.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1 items-center justify-center bg-gray-100 p-6">
      <ThemedText className="mb-6 text-3xl font-bold">Log In</ThemedText>
      <ThemedTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="mb-4 w-full rounded-lg border border-gray-300 p-4"
      />
      <ThemedTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-6 w-full rounded-lg border border-gray-300 p-4"
      />
      <ThemedButton title="Log In" onPress={handleLogin} loading={loading} />
      <Link href="/(auth)/sign-up" asChild>
        <ThemedText className="mt-4 text-blue-600">
          Don't have an account? Sign Up
        </ThemedText>
      </Link>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView className="flex-1 items-center justify-center bg-white bg-opacity-50">
          <ThemedView className="p-6">
            <ThemedText className="text-lg font-bold">Error</ThemedText>
            <ThemedText className="mt-2">{errorMessage}</ThemedText>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 rounded bg-blue-500 p-2">
              <ThemedText className="text-center text-white">Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}
