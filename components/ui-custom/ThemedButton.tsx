import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Optional loading state
  className?: string; // Optional className for additional styling
  textClassName?: string; // Optional className for text styling
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ title, onPress, loading, className, textClassName }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex items-center justify-center rounded-lg bg-blue-500 p-3 ${className}`}
      disabled={loading} // Disable button when loading
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`text-lg font-semibold text-white ${textClassName}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
