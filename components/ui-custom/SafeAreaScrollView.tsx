import { ScrollView, ScrollViewProps, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';

export function SafeAreaScrollView(props: ScrollViewProps) {
  const { children, style, ...otherProps } = props;
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor }, style]}>
      <ScrollView {...otherProps} contentContainerStyle={[{ backgroundColor }, StyleSheet.flatten(otherProps.contentContainerStyle)]}>
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
