import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Optional loading state
  disabled?: boolean;
  transparent?: boolean; // Optional transparent style
  className?: string; // Optional className for additional styling
  textClassName?: string; // Optional className for text styling
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconClassName?: string;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
  transparent = false,
  className = '',
  textClassName = '',
  leadingIcon,
  trailingIcon,
  iconClassName = '',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  // Determine text color based on transparent prop
  const textColor = transparent ?
    colorScheme === 'light' ? Colors[colorScheme].tint : Colors[colorScheme].text :
    colorScheme === 'light' ? 'white' : Colors[colorScheme].text;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row items-center justify-center rounded-lg p-3 shadow-custom ${transparent ? 'bg-transparent' : ''} ${className}`}
      style={{
        backgroundColor: transparent ? 'transparent' : tintColor,
        opacity: (disabled || loading) ? 0.5 : 1,
      }}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leadingIcon && (
            <View className={`mr-2 ${iconClassName}`}>
              {leadingIcon}
            </View>
          )}
          <Text
            className={`font-body text-lg font-semibold ${textClassName}`}
            style={{ color: textColor }}
          >
            {title}
          </Text>
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
