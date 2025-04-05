import { useFonts } from 'expo-font';
import { usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { StorageKeys } from '@/constants/Storage';
import { StoryProvider } from '@/contexts/StoryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCurrentUser } from '@/services/AuthAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '@/utils/Logger';
import '@/global.css';

// Create auth context
interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    'IndieFlower': require('../assets/fonts/IndieFlower-Regular.ttf'),
    'SpaceGrotesk': require('../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf'),
    'EBGaramond': require('../assets/fonts/EBGaramond-VariableFont_wght.ttf'),
  });

  // Set initial authentication state based on the current path
  // TODO: This is a temporary solution to ensure the user is authenticated when they navigate to the sign-up or login pages.
  const isAuthRoute = pathname?.startsWith('/sign-up');
  const [isAuthenticated, setAuthenticated] = useState(!isAuthRoute);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Override and set to false if we're on an auth route
      if (isAuthRoute) {
        setAuthenticated(false);
        return;
      }

      const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
      if (token) {
        try {
          await getCurrentUser(token);
          setAuthenticated(true);
        } catch (error) {
          Logger.error(`Token validation failed: ${error}`);
          await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
          setAuthenticated(false);
        }
      } else {
        Logger.warn(`Token validation not found!`);
        setAuthenticated(false);
      }
    };

    checkAuthentication();

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthRoute]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      <StoryProvider>
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(auth)"
              redirect={isAuthenticated}
            />
            <Stack.Screen
              name="(tabs)"
              redirect={!isAuthenticated}
            />
            <Stack.Screen
              name="+not-found"
              options={{ presentation: 'modal' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </StoryProvider>
    </AuthContext.Provider>
  );
}
