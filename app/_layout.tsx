import { useFonts } from 'expo-font';
import { usePathname, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated'; // NOTE: This is required for the app to work on web
import { View } from 'react-native';
import { SplashScreenComponent } from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StoryProvider } from '@/contexts/StoryContext';
import '@/global.css'; // NOTE: This is required for the app to work on web
import Logger from '@/utils/Logger';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutRoutes() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut, setAuthenticated, setIsLoading } = useAuth();

  // Sign out current user when they navigate to sign-up route.
  useEffect(() => {
    if (isAuthenticated && pathname.includes('sign-up')) {
      Logger.info('Signing out current user and redirecting to sign-up page...');
      signOut();
    }
  }, [pathname, isAuthenticated, signOut]);

  // Handle auth state changes and show splash screen during transitions
  useEffect(() => {
    const handleAuthTransition = async () => {
      if (isAuthenticated && pathname.includes('login')) {
        try {
          // Small delay to ensure transition feels natural
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Make sure SplashScreen is prevented from auto-hiding during transition
          await SplashScreen.preventAutoHideAsync().catch((e) => {
            Logger.error(`Failed to prevent auto-hide of splash screen: ${e}`);
          });
        } finally {
          // Hide splash after a short delay to ensure the new screen is ready
          setTimeout(async () => {
            await SplashScreen.hideAsync().catch((e) => {
              Logger.error(`Failed to hide splash screen: ${e}`);
            });
            // Set isLoading to false after navigation and splash screen handling
            setIsLoading(false);
          }, 500);
        }
      }
    };

    handleAuthTransition();
  }, [isAuthenticated, pathname, router, setIsLoading]);

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <StoryProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(auth)"
            redirect={isAuthenticated && !pathname.includes('sign-up')}
          />
          <Stack.Screen
            name="(tabs)"
            redirect={!isAuthenticated}
          />
          <Stack.Screen
            name="(profile)"
          />
          <Stack.Screen
            name="editor"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="payments"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="privacy-policy"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="terms-of-service"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="legal"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{ presentation: 'modal' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </StoryProvider>
  );
}

export default function RootLayout() {
  const [rootIsReady, setRootIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'IndieFlower': require('../assets/fonts/IndieFlower-Regular.ttf'),
    'SpaceGrotesk': require('../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf'),
    'EBGaramond': require('../assets/fonts/EBGaramond-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();

        // Artificially delay for 1 second to make splash visible during testing
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setRootIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (rootIsReady && (fontsLoaded || fontError)) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [rootIsReady, fontsLoaded, fontError]);

  if (!rootIsReady || (!fontsLoaded && !fontError)) {
    return <SplashScreenComponent />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <RootLayoutRoutes />
      </AuthProvider>
    </View>
  );
}
