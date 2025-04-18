import { ScrollView, ScrollViewProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SafeAreaScrollView(props: ScrollViewProps) {
  const { children, style, ...otherProps } = props;

  return (
    <SafeAreaView style={[{ flex: 1 }, style]}>
      <ScrollView {...otherProps}>
        {/* Added padding to prevent shadow effects of child componentsfrom being cut off */}
        <View style={{ flex: 1 }} className="w-full p-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
