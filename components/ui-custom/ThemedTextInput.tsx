import { TextInput, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput(props: ThemedTextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <TextInput
      style={[{ color, backgroundColor }, style]}
      className="rounded-lg border border-gray-300 p-3"
      placeholderTextColor={`${color}80`}
      {...otherProps}
    />
  );
}
