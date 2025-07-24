import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { TextInput, TextInputProps, View, Animated, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Base spacing unit - equivalent to Tailwind's spacing scale
const SPACING = 4; // 4px base unit (p-2 = 2 * 4 = 8px)

// Font size constants based on Tailwind scale
const TEXT_BASE = 16; // text-base = 16px
const TEXT_SM = 14; // text-sm = 14px
const TEXT_XS = 12; // text-xs = 12px for focused/floating label

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
    // NOTE: +2 is to match the border-2
    left: SPACING * 2 + 2, // calc(var(--spacing) * 2) = 8px to match p-2
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      // NOTE: +4 is to match the border-2 (2 pixels on each side)
      outputRange: [SPACING * 2 + 4, -SPACING * 2], // [10px, -8px] - centered in input, then floating above
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [TEXT_BASE, TEXT_XS], // 16px (text-base) to 12px (text-xs)
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
      outputRange: [0, SPACING], // 0 to 4px padding
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
          className={`w-full rounded-lg border-2 border-gray-600 ${editable === false ? '!bg-gray-400/40' : '!bg-white/40'} p-2 text-base shadow-custom backdrop-blur-sm transition-colors duration-200 focus:border-blue-500 focus:bg-white focus:shadow-custom-focused dark:border-gray-800 dark:bg-gray-800/80 dark:focus:border-blue-400 dark:focus:bg-gray-800`}
          style={[{ color, backgroundColor }, style]}
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
            style={{
              position: 'absolute',
              // NOTE: +2 is to match the border-2
              top: SPACING * 2 + 2, // calc(var(--spacing) * 2) = 8px to match top-2
              // NOTE: +2 is to match the border-2
              right: SPACING * 2 + 2, // calc(var(--spacing) * 2) = 8px to match right-2
            }}
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
