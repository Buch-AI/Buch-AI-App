import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Optional loading state
  disabled?: boolean;
  className?: string; // Optional className for additional styling
  textClassName?: string; // Optional className for text styling
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconClassName?: string;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ title, onPress, loading, disabled, className, textClassName, leadingIcon, trailingIcon, iconClassName }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row items-center justify-center rounded-lg p-3 ${className}`}
      style={{
        backgroundColor: tintColor,
        opacity: (disabled || loading) ? 0.5 : 1,
      }}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={colorScheme === 'light' ? 'white' : Colors[colorScheme].text} />
      ) : (
        <>
          {leadingIcon && (
            <View className={`mr-2 ${iconClassName}`}>
              {leadingIcon}
            </View>
          )}
          <Text className={`font-body text-lg font-semibold text-white dark:text-black ${textClassName}`}>{title}</Text>
          {trailingIcon && (
            <View className={`ml-2 ${iconClassName}`}>
              {trailingIcon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
