import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LegalItem {
  title: string;
  subtitle: string;
  route: string;
}

const legalItems: LegalItem[] = [
  {
    title: 'Privacy Policy',
    subtitle: 'How we handle your personal information',
    route: '/privacy-policy',
  },
  {
    title: 'Terms of Service',
    subtitle: 'Terms and conditions for using Buch AI',
    route: '/terms-of-service',
  },
];

export default function LegalScreen() {
  const textColor = useThemeColor({}, 'text');

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        {/* Header with cross button */}
        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Legal
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View className="my-4">
          <ThemedText className="mt-2 opacity-60">
            Find important documents and policies here.
          </ThemedText>
        </View>

        <SafeAreaScrollView>
          {legalItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleItemPress(item.route)}
              className="mb-3 rounded-lg bg-white/60 p-4 active:bg-white/80 dark:bg-gray-800/60 dark:active:bg-gray-800/80"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="mb-1 font-semibold">
                    {item.title}
                  </ThemedText>
                  <ThemedText className="text-xs opacity-60">
                    {item.subtitle}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={textColor}
                  style={{ opacity: 0.5 }}
                />
              </View>
            </Pressable>
          ))}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
