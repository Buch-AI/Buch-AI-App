import { View } from 'react-native';
import { useTabBarPadding } from './useTabBarPadding';

interface TabBarSpacerViewProps {
  extraPadding?: number;
}

/**
 * A simple component to add at the bottom of screen content to provide
 * proper spacing for the floating tab bar
 */
export function TabBarSpacerView({ extraPadding = 0 }: TabBarSpacerViewProps) {
  const padding = useTabBarPadding(extraPadding);
  
  return <View style={{ height: padding }} />;
} 