import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedContainerView className="mb-4">
      <TouchableOpacity
        className="flex-row items-center gap-2 rounded-lg bg-gray-200 p-3"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="body" className="font-semibold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <View className="ml-6 mt-1">{children}</View>}
    </ThemedContainerView>
  );
}
