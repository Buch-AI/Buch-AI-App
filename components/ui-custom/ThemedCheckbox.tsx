import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedCheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const ThemedCheckbox: React.FC<ThemedCheckboxProps> = ({
  checked,
  onPress,
  disabled = false,
  className = '',
  style,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center rounded-lg border border-gray-300 ${className}`}
      style={{
        backgroundColor: checked ? '#4F46E5' : 'transparent', // Indigo-600 when checked
        opacity: disabled ? 0.5 : 1,
        width: 24,
        height: 24,
        ...style as any,
      }}
    >
      {checked && (
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
};
