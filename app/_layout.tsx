import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { StoryProvider } from '@/contexts/StoryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCurrentUser } from '@/services/AuthAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '@/utils/Logger';
import { StorageKeys } from '@/constants/Storage';
import '@/global.css';

// Define route types
type AuthRoutes = {
  '(auth)': {
    'login': undefined;
    'sign-up': undefined;
  };
};

type TabRoutes = {
  '(tabs)': {
    'index': undefined;
    'community': undefined;
  };
};

type RootRoutes = AuthRoutes & TabRoutes & {
  '+not-found': undefined;
};

// Create auth context
interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Set this initially as true so that there is no unnecessary redirect
  const [isAuthenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
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
