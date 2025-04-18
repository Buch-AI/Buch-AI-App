import { View } from 'react-native';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { IconSymbol } from '@/components/ui-default/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CommunityScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <View className="my-4">
          <ThemedText type="title">Community</ThemedText>
        </View>

        <View className="flex-1 items-center justify-center">
          <IconSymbol
            name="person.2.fill"
            size={64}
            color={Colors[colorScheme ?? 'light'].tint}
          />
          <ThemedText type="title" className="mb-2 text-center">
          Coming Soon
          </ThemedText>
          <ThemedText className="max-w-[360px] text-center text-gray-500">
          We're working hard to bring you a space where you can share and discover amazing stories with other writers.
          </ThemedText>
        </View>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
