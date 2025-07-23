import React from 'react';
import { View, ActivityIndicator, ActivityIndicatorProps, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export interface SpinnerProps extends Omit<ActivityIndicatorProps, 'color'> {
  // View wrapper props
  wrapperProps?: ViewProps;
  className?: string;
  wrapperClassName?: string;

  // Color theming
  lightColor?: string;
  darkColor?: string;
  color?: string;

  // Layout options
  centered?: boolean;
}

export function Spinner({
  wrapperProps,
  className = '',
  wrapperClassName = '',
  lightColor,
  darkColor,
  color,
  centered = false,
  ...activityIndicatorProps
}: SpinnerProps) {
  // Use themed color if no explicit color is provided
  const themedColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const spinnerColor = color || themedColor;

  // Base wrapper classes
  const baseWrapperClass = centered ? 'flex flex-row items-center justify-center' : '';
  const finalWrapperClass = `${baseWrapperClass} ${wrapperClassName}`.trim();

  return (
    <View
      className={finalWrapperClass}
      {...wrapperProps}
    >
      <ActivityIndicator
        color={spinnerColor}
        className={className}
        {...activityIndicatorProps}
      />
    </View>
  );
}
