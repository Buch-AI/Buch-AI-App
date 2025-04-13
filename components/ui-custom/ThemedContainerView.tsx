import { View, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedContainerViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedContainerView(props: ThemedContainerViewProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      className={`mx-auto min-h-screen w-full max-w-[540px] px-4 sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1140px] xl:max-w-[1320px] ${className || ''}`}
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
