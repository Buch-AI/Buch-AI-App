import { forwardRef } from 'react';
import { Text, TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'title' | 'body' | 'book';
  className?: string;
};

export const ThemedText = forwardRef<Text, ThemedTextProps>(({ type = 'body', className = '', ...props }, ref) => {
  const baseStyle = (() => {
    switch (type) {
    case 'title':
      return 'text-xl font-brand font-bold';
    case 'book':
      return 'text-lg font-book leading-relaxed';
    default:
      return 'text-base font-body';
    }
  })();

  const color = useThemeColor({ light: props.lightColor, dark: props.darkColor }, 'text');
  return <Text ref={ref} className={`text-black dark:text-white ${baseStyle} ${className}`} style={[{ color }, props.style]} {...props} />;
});
