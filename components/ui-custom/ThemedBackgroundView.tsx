import { View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedBackgroundViewProps {
  children: React.ReactNode;
}

export function ThemedBackgroundView({
  children,
}: ThemedBackgroundViewProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View
      style={{ flex: 1, backgroundColor }}
      className={`size-full`}
    >
      {children}
    </View>
  );
}
