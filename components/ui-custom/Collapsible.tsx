import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { IconSymbol } from '@/components/ui-default/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView className="mb-4">
      <TouchableOpacity
        className="flex-row items-center gap-2 rounded-lg bg-gray-200 p-3"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView className="ml-6 mt-1">{children}</ThemedView>}
    </ThemedView>
  );
}
