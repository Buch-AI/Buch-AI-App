import { useState, useRef } from 'react';
import { ScrollView, ScrollViewProps, View, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Shadow effect types
type ShadowEffectType = 'gradient' | 'blur' | 'line' | 'dots';

interface SafeAreaScrollViewProps extends ScrollViewProps {
  showShadows?: boolean;
  shadowOpacity?: number; // 0-100 value to control shadow strength
  shadowHeight?: number; // Height of the shadow in pixels
  shadowEffect?: ShadowEffectType; // Type of shadow effect to use
}

export function SafeAreaScrollView(props: SafeAreaScrollViewProps) {
  const {
    children,
    style,
    showShadows = true,
    shadowOpacity = 10,
    shadowHeight = 10,
    shadowEffect = 'gradient',
    ...otherProps
  } = props;

  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Calculate shadow styles based on props
  const shadowOpacityValue = Math.max(0, Math.min(100, shadowOpacity)) / 100;

  // Base classes for positioning
  const baseShadowClasses = `absolute left-0 right-0 z-10 pointer-events-none`;

  // Get shadow classes based on the selected effect
  const getShadowClasses = (isTop: boolean) => {
    const direction = isTop ? 'to-b' : 'to-t';
    const opacity = Math.round(shadowOpacityValue * 100);

    switch (shadowEffect) {
    case 'gradient':
      return `${baseShadowClasses} ${isTop ? 'top-0' : 'bottom-0'} bg-gradient-${direction} from-black/${opacity} to-transparent`;

    case 'blur':
      return `${baseShadowClasses} ${isTop ? 'top-0' : 'bottom-0'} backdrop-blur-[1px] bg-black/${opacity * 0.4}`;

    case 'line':
      // Use opacity class for the View rather than on the border directly
      return `${baseShadowClasses} ${isTop ? 'top-0 border-t' : 'bottom-0 border-b'} border-black/${opacity} bg-transparent`;

    case 'dots':
      return `${baseShadowClasses} ${isTop ? 'top-0' : 'bottom-0'} bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi+P//PwMTEwMDmgAQYAAuDQMw56cjnwAAAABJRU5ErkJggg==')] bg-repeat-x opacity-${opacity}`;

    default:
      return `${baseShadowClasses} ${isTop ? 'top-0' : 'bottom-0'} bg-gradient-${direction} from-black/${opacity} to-transparent`;
    }
  };

  const updateShadows = (
    offsetY: number = 0,
    scrollHeight: number = scrollViewHeight,
    totalHeight: number = contentHeight,
  ) => {
    if (!showShadows) return;

    // Top shadow appears when scrolled down
    setShowTopShadow(offsetY > 10);

    // Bottom shadow appears when content is taller than container and not at bottom
    const hasOverflow = totalHeight > scrollHeight;
    const isAtBottom = offsetY + scrollHeight >= totalHeight - 10;
    setShowBottomShadow(hasOverflow && !isAtBottom);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    updateShadows(contentOffset.y, layoutMeasurement.height, contentSize.height);

    // Call original onScroll if provided
    props.onScroll?.(event);
  };

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
    updateShadows(0, height, contentHeight);

    // Call original onLayout if provided
    props.onLayout?.(event);
  };

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
    updateShadows(0, scrollViewHeight, height);

    // Call original onContentSizeChange if provided
    props.onContentSizeChange?.(width, height);
  };

  // Custom height based on effect type
  const getShadowHeight = () => {
    if (shadowEffect === 'line') return 1;
    if (shadowEffect === 'dots') return 2;
    return shadowHeight;
  };

  // Calculate the final content container style
  const contentContainerStyle = { 
    flex: 1, 
    // NOTE: Top and bottom padding are kept as is
    paddingTop: 16,
    paddingBottom: 16,
    // NOTE: Left and right padding are counteracted by the margin on the ScrollView
    paddingLeft: 16,
    paddingRight: 16,
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, style]}>
      <View className="relative flex-1">
        {showShadows && showTopShadow && (
          <View
            className={getShadowClasses(true)}
            style={{ height: getShadowHeight() }}
          />
        )}

        <ScrollView
          ref={scrollViewRef}
          {...otherProps}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleScrollViewLayout}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={contentContainerStyle}
          style={{ 
            marginTop: 0,
            marginBottom: 0,
            // NOTE: Left and right margins are negative to give space for overflowing shadows
            marginLeft: -16,
            marginRight: -16,
          }}
        >
          {children}
        </ScrollView>

        {showShadows && showBottomShadow && (
          <View
            className={getShadowClasses(false)}
            style={{ height: getShadowHeight() }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
