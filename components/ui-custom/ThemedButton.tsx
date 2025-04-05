import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Optional loading state
  disabled?: boolean;
  className?: string; // Optional className for additional styling
  textClassName?: string; // Optional className for text styling
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ title, onPress, loading, disabled, className, textClassName }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex items-center justify-center rounded-lg p-3 ${className}`}
      style={{
        backgroundColor: tintColor,
        opacity: (disabled || loading) ? 0.5 : 1,
      }}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={colorScheme === 'light' ? 'white' : Colors[colorScheme].text} />
      ) : (
        <Text className={`font-body text-lg font-semibold text-white dark:text-black ${textClassName}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
