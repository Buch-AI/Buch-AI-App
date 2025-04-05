import { View } from 'react-native';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { IconSymbol } from '@/components/ui-default/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CommunityScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedView className="flex-1 items-center justify-center p-4">
      <View className="items-center space-y-4">
        <IconSymbol
          name="person.2.fill"
          size={64}
          color={Colors[colorScheme ?? 'light'].tint}
        />
        <ThemedText type="title" className="text-center">
          Coming Soon
        </ThemedText>
        <ThemedText className="max-w-[360px] text-center text-gray-500">
          We're working hard to bring you a space where you can share and discover amazing stories with other writers.
        </ThemedText>
      </View>
    </ThemedView>
  );
}
