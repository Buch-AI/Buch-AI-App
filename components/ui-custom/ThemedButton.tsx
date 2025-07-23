import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'text' | 'icon';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ThemedButtonProps {
  title?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconOnly = false,
  pill = false,
  style,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme].tint;

  // Get variant-specific class names
  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  // Set classes based on variant
  switch (variant) {
  case 'primary':
    // For primary, we use the tint color directly in style instead of classes
    bgClass = '';
    textClass = isDark ? 'text-white' : 'text-white';
    break;
  case 'secondary':
    bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';
    textClass = isDark ? 'text-white' : 'text-gray-800';
    break;
  case 'danger':
    bgClass = 'bg-red-400';
    textClass = 'text-white';
    break;
  case 'success':
    textClass = 'text-white';
    bgClass = 'bg-green-400';
    break;
  case 'outline':
    // For outline, we use tint color directly for text and border
    bgClass = 'bg-transparent';
    borderClass = 'border border-gray-200'; // Default border, will be overridden by style
    textClass = 'text-blue-400'; // Default text color, will be overridden by style
    break;
  case 'text':
    // For text, we use tint color directly for text
    bgClass = 'bg-transparent';
    borderClass = 'border border-gray-200'; // Default border, will be overridden by style
    textClass = 'text-blue-400'; // Default text color, will be overridden by style
    break;
  case 'icon':
    bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';
    textClass = isDark ? 'text-white' : 'text-gray-800';
    break;
  }

  // Padding classes
  const paddingClasses = {
    xs: 'py-1 px-2',
    sm: 'py-2 px-3',
    md: 'py-2 px-3',
    lg: 'py-3 px-4',
  };

  // Text size classes
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Combine all classes
  const buttonClasses = `${bgClass} ${borderClass} flex flex-row items-center justify-center ${paddingClasses[size]} ${pill ? 'rounded-full' : 'rounded-lg'} shadow-custom ${className}`;
  const textClasses = `${textClass} font-body ${textSizeClasses[size]} font-semibold`;

  // Special style handling for variants that use tintColor
  const buttonStyle: any = {
    opacity: (disabled || loading) ? 0.5 : 1,
    ...(style as any),
  };

  // For primary and other variants that need tintColor
  if (variant === 'primary') {
    buttonStyle.backgroundColor = tintColor;
  }

  // For outline and text variants that need tintColor for text/border
  if (variant === 'outline') {
    buttonStyle.borderColor = tintColor;
    buttonStyle.borderWidth = 1;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={buttonClasses}
      style={buttonStyle}
      disabled={disabled || loading}>
      {loading ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            minHeight: 24,
          }}
        >
          <ActivityIndicator color={variant === 'outline' || variant === 'text' ? tintColor : (textClass === 'text-white' ? '#FFFFFF' : '#374151')} />
        </View>
      ) : (
        <>
          {icon && iconOnly && (
            <View>
              {icon}
            </View>
          )}
          {!iconOnly && (
            <>
              {icon && <View className="mr-2">{icon}</View>}
              {title && (
                <Text
                  className={textClasses}
                  style={variant === 'outline' || variant === 'text' ? { color: tintColor } : {}}
                >
                  {title}
                </Text>
              )}
            </>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
