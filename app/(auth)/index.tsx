import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedText } from '@/components/ui-custom/ThemedText';

export default function AuthIndex() {
  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1 p-6">
        <SafeAreaScrollView>
          <View pointerEvents="none" className="mb-8 w-full items-center">
            <ThemedImage
              source={require('@/assets/images/illustration-sample-1@2000.png')}
              rfSize={160}
            />
          </View>

          <ThemedText
            type="title"
            className="mb-3 text-center text-4xl font-bold"
          >
          Welcome to Buch AI
          </ThemedText>

          <ThemedText
            type="body"
            className="mb-12 text-center text-lg text-gray-600 dark:text-gray-400"
          >
          Your personal AI-powered short story ideation and illustration companion.
          </ThemedText>

          <View className="w-full">
            <ThemedButton
              title="Get started"
              onPress={() => router.push('/sign-up')}
              className="my-2"
            />
            <ThemedButton
              title="I already have an account"
              onPress={() => router.push('/login')}
              variant="text"
            />
          </View>

          <View className="h-10" />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
