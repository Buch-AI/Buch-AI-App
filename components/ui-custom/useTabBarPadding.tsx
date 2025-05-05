import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logger from '@/utils/Logger';

/**
 * Custom hook to calculate the necessary bottom padding to avoid content being obscured by the floating tab bar
 * 
 * @param extraPadding Optional additional padding to add (default: 0)
 * @returns A number representing the padding in pixels to apply to the bottom of scrollable content
 */
export function useTabBarPadding(extraPadding: number = 0): number {
  // Try to get tab bar height from React Navigation
  let tabBarHeight;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (error) {
    // React Navigation's hook might fail in some contexts
    // Use fallback value based on _layout.tsx
    Logger.info('Failed to get tab bar height from useBottomTabBarHeight, using fallback value');
    tabBarHeight = 60 + (Platform.OS === 'ios' ? 20 : 0); // height + paddingBottom from _layout.tsx
  }
  
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  
  // Calculate padding based on tab bar position and platform
  // The 20 value matches the bottom: 20 in the tab bar style in _layout.tsx
  const tabBarBottomMargin = 20;
  const totalTabBarHeight = tabBarHeight + tabBarBottomMargin;
  
  // Add platform-specific adjustments if needed
  const platformAdjustment = Platform.OS === 'ios' ? 10 : 0;
  
  // Fallback minimum padding to ensure content is not obscured
  const minimumPadding = 80;
  
  const calculatedPadding = totalTabBarHeight + platformAdjustment + extraPadding;
  
  // Use the maximum of calculated padding and minimum padding
  return Math.max(calculatedPadding, minimumPadding);
} 