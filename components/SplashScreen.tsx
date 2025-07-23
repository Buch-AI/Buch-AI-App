import React from 'react';
import { View } from 'react-native';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spinner } from './ui-custom/Spinner';

export function SplashScreenComponent() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View className="flex-1 items-center justify-center p-8" style={{ backgroundColor, pointerEvents: 'none' }}>
      <View className="items-center justify-center">
        <ThemedImage
          source={require('../assets/images/favicon@512.png')}
          rfSize={140}
          className="mb-4"
        />
        <ThemedText type="title" className="text-center text-4xl font-bold tracking-wide text-white">
          Buch AI
        </ThemedText>
        <Spinner size="small" className="mt-6" />
      </View>
    </View>
  );
}
