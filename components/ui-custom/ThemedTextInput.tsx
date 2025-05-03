import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { TextInput, TextInputProps, View, Animated, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  label: string;
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedTextInput(props: ThemedTextInputProps) {
  const { style, lightColor, darkColor, className, label, value, onFocus, onBlur, secureTextEntry, editable, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -9],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [color + '40', color + '80'],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', backgroundColor],
    }),
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  };

  return (
    <View className={className}>
      <View className="relative">
        <Animated.Text style={labelStyle as any}>
          {label}
        </Animated.Text>
        <TextInput
          style={[{ color, backgroundColor }, style]}
          className={`w-full rounded-lg border border-gray-200 ${editable === false ? '!bg-gray-400/40' : '!bg-white/40'} p-4 text-base shadow-custom backdrop-blur-sm transition-colors duration-200 focus:border-blue-500 focus:bg-white focus:shadow-custom-focused dark:border-gray-800 dark:bg-gray-800/80 dark:focus:border-blue-400 dark:focus:bg-gray-800`}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          {...otherProps}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color={color + '80'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
