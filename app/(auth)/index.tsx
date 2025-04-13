import { router } from 'expo-router';
import { Image, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';

export default function AuthIndex() {
  const illustrationSize = RFValue(200); // Slightly larger for landing page

  return (
    <SafeAreaScrollView>
      <ThemedContainerView className="flex-1 items-center justify-center p-6">
        <View pointerEvents="none" className="mb-8">
          <Image
            source={require('@/assets/images/illustration-sample-1.png')}
            style={{
              width: illustrationSize,
              height: illustrationSize * 0.75,
              resizeMode: 'contain',
            }}
            accessible={false}
          />
        </View>

        <ThemedText
          type="title"
          className="mb-3 text-center text-4xl font-bold"
        >
          Welcome to Buch AI
        </ThemedText>

        <ThemedText
          type="book"
          className="mb-12 text-center text-lg text-gray-600 dark:text-gray-400"
        >
          Your personal AI storytelling companion.
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
            className="my-2"
            transparent
          />
        </View>
      </ThemedContainerView>
    </SafeAreaScrollView>
  );
}
