import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack as ExpoStack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/components/auth/Login';
import SignUpScreen from '@/components/auth/SignUp';
import { StoryProvider } from '@/contexts/StoryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCurrentUser } from '@/services/AuthAdapter';
import TabNavigator from './(tabs)/index';
import NotFoundScreen from './+not-found';
import AsyncStorage from '@react-native-async-storage/async-storage';

import '@/global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Define the type for the AuthNavigator props
interface AuthNavigatorProps {
  setAuthenticated: (value: boolean) => void;
}

function AuthNavigator({ setAuthenticated }: AuthNavigatorProps) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {() => <LoginScreen setAuthenticated={setAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        try {
          await getCurrentUser(token);
          setAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          await AsyncStorage.removeItem('access_token');
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
    };

    checkAuthentication();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <StoryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          {isAuthenticated ? (
            <Stack.Navigator>
              <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          ) : (
            <AuthNavigator setAuthenticated={setAuthenticated} />
          )}
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </StoryProvider>
  );
}
