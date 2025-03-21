import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { login } from '@/services/AuthAdapter'; // Import the login function from AuthAdapter

// Define the type for the navigation prop
interface AuthStackParamList extends ParamListBase {
  Login: undefined;
  SignUp: undefined;
}

export default function LoginScreen({ setAuthenticated }: { setAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      const tokenResponse = await login(email, password); // Call the login function from AuthAdapter
      const token = tokenResponse.access_token; // Get the access token

      if (token) {
        // Store the token in local storage or context
        await AsyncStorage.setItem('access_token', token); // Store token for future requests
        setAuthenticated(true); // Set authenticated state to true
        console.log('Access Token:', token);
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred during sign in.');
      setModalVisible(true);
    } finally {
      setLoading(false); // Stop loading
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
      <ThemedText onPress={() => navigation.navigate('SignUp')} className="mt-4 text-blue-600">
        Don't have an account? Sign Up
      </ThemedText>

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
