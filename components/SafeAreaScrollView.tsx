import { ScrollView, ScrollViewProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SafeAreaScrollView(props: ScrollViewProps) {
  const { children, ...otherProps } = props;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView {...otherProps}>
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
