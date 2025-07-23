import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

interface ThemedActivityOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Text to display below the activity indicator */
  text?: string;
  /** Background opacity (0-1). Default is 0.2 */
  backgroundOpacity?: number;
  /** Activity indicator size. Default is 'large' */
  size?: 'small' | 'large';
  /** Custom activity indicator color. Defaults to theme tint color */
  indicatorColor?: string;
}

/**
 * A full-screen semi-transparent overlay with an activity indicator and optional text.
 *
 * This component provides a consistent loading overlay experience across the app.
 * It covers the entire screen with a semi-transparent background and shows a themed
 * activity indicator with customizable text.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ThemedActivityOverlay visible={isLoading} text="Loading..." />
 *
 * // With custom opacity
 * <ThemedActivityOverlay
 *   visible={isLoading}
 *   text="Processing payment..."
 *   backgroundOpacity={0.5}
 * />
 *
 * // Small indicator with custom color
 * <ThemedActivityOverlay
 *   visible={isLoading}
 *   text="Saving..."
 *   size="small"
 *   indicatorColor="#ff6b6b"
 * />
 * ```
 */
export function ThemedActivityOverlay({
  visible,
  text = 'Loading...',
  backgroundOpacity = 0.2,
  size = 'large',
  indicatorColor,
}: ThemedActivityOverlayProps) {
  const tintColor = useThemeColor({}, 'tint');
  const finalIndicatorColor = indicatorColor ?? tintColor;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Hide component after fade out animation completes
        setShouldRender(false);
      });
    }
  }, [visible, fadeAnim]);

  // Don't render anything if not visible and animation is complete
  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
        opacity: fadeAnim,
      }}
    >
      <View className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <View 
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 60,
            minHeight: 60,
          }}
        >
          <ActivityIndicator size={size} color={finalIndicatorColor} />
          {text && (
            <ThemedText type="body" className="mt-4 text-center">
              {text}
            </ThemedText>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
