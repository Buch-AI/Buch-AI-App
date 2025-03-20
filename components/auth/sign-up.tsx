import { useNavigation } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { registerUser } from '@/services/databaseAdapter';

interface AuthStackParamList extends ParamListBase {
  SignIn: undefined;
  SignUp: undefined;
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleSignUp = async () => {
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
        console.log('Sign up successful');
        navigation.navigate('SignIn');
      } catch (error: any) {
        console.error('Sign up failed:', error);
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

  return (
    <ThemedView className="flex-1 items-center justify-center bg-gray-100 p-6">
      <ThemedText className="mb-6 text-3xl font-bold">Sign Up</ThemedText>
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
        className="mb-4 w-full rounded-lg border border-gray-300 p-4"
      />
      <ThemedTextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="mb-6 w-full rounded-lg border border-gray-300 p-4"
      />
      <ThemedButton title="Sign Up" onPress={handleSignUp} loading={loading} />
      <ThemedText onPress={() => navigation.navigate('SignIn')} className="mt-4 text-blue-600">
        Already have an account? Sign In
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
