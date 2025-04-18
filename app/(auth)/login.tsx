import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { StorageKeys } from '@/constants/Storage';
import { login } from '@/services/AuthAdapter';
import Logger from '@/utils/Logger';
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
        await AsyncStorage.setItem(StorageKeys.AUTH_JWT, token);
        setAuthenticated(true);
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      Logger.error(`Login failed: ${error}`);
      setErrorMessage('An error occurred during sign in.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const illustrationSize = RFValue(160); // Base size for a 680px screen height

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1 p-6">
        <SafeAreaScrollView>
          <View pointerEvents="none" className="w-full items-center">
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
          <ThemedButton title="Log In" onPress={handleLogin} loading={loading} />
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <ThemedText className="mt-4 text-center text-blue-600">
                Don't have an account? Sign up.
              </ThemedText>
            </Pressable>
          </Link>
        </SafeAreaScrollView>
      </ThemedContainerView>

      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Error"
        message={errorMessage}
      />
    </ThemedBackgroundView>
  );
}
