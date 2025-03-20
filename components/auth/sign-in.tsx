import { useNavigation } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { authenticateUser } from '@/services/databaseAdapter'; // Import the authenticate function

// Define the type for the navigation prop
interface AuthStackParamList extends ParamListBase {
  SignIn: undefined;
  SignUp: undefined;
}

export default function SignInScreen({ setAuthenticated }: { setAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleSignIn = async () => {
    setLoading(true); // Start loading
    try {
      const isAuthenticated = await authenticateUser(email, password);
      if (isAuthenticated) {
        setAuthenticated(true);
      } else {
        setErrorMessage('Invalid email or password.');
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setErrorMessage('An error occurred during sign in.');
      setModalVisible(true);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <ThemedView className="flex-1 items-center justify-center bg-gray-100 p-6">
      <ThemedText className="mb-6 text-3xl font-bold">Sign In</ThemedText>
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
      <ThemedButton title="Sign In" onPress={handleSignIn} loading={loading} />
      <ThemedText onPress={() => navigation.navigate('SignUp')} className="mt-4 text-blue-600">
        Don't have an account? Sign Up
      </ThemedText>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <ThemedView className="rounded-lg bg-white p-6 shadow-lg">
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
