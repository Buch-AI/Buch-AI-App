import React from 'react';
import { View, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ActivityIndicator } from 'react-native';
import { ThemedImage } from './ui-custom/ThemedImage';

export function SplashScreenComponent() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View className="flex-1 items-center justify-center p-8" style={{ backgroundColor }}>
      <View className="items-center justify-center">
        <ThemedImage
          source={require('../assets/images/illustration-sample-1@512.png')}
        />
        <ThemedText type="title" className="text-center text-4xl font-bold text-white tracking-wide">
          Buch AI
        </ThemedText>
        <ActivityIndicator size="small" className="mt-6" />
      </View>
    </View>
  );
} 