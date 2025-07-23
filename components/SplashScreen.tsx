import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function SplashScreenComponent() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View 
      style={{ 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor,
        pointerEvents: 'none'
      }}
    >
      <ThemedImage
        source={require('../assets/images/favicon@512.png')}
        rfSize={140}
        className="mb-4"
      />
      <ThemedText type="title" className="text-center text-4xl font-bold tracking-wide text-white">
        Buch AI
      </ThemedText>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 24,
          minWidth: 40,
          minHeight: 40,
        }}
      >
        <ActivityIndicator size="small" />
      </View>
    </View>
  );
}
