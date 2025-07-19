import React from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface ThemedImageProps extends Omit<ImageProps, 'style'> {
  rfSize?: number;
  aspectRatio?: number;
  style?: StyleProp<Omit<ImageStyle, 'width' | 'height'>>;
  customWidth?: number;
  customHeight?: number;
}

export function ThemedImage({
  source,
  rfSize,
  aspectRatio = 1.0,
  style,
  ...restProps
}: ThemedImageProps) {
  // Calculate responsive dimensions or use full width
  const baseStyle = rfSize 
    ? {
        width: RFValue(rfSize),
        height: RFValue(rfSize) * aspectRatio,
        resizeMode: 'contain' as const,
      }
    : {
        width: '100%' as const,
        aspectRatio: aspectRatio,
        resizeMode: 'contain' as const,
      };

  // Web-specific styles to prevent selection, copying, and dragging
  const webSecurityStyle = Platform.OS === 'web' ? {
    userSelect: 'none',
    webkitUserSelect: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
    webkitUserDrag: 'none',
    webkitTouchCallout: 'none',
    pointerEvents: 'none',
  } as any : {};

  // Prevent context menu on web
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    return false;
  };

  // Web-specific props
  const webProps = Platform.OS === 'web' ? {
    draggable: false,
    onDragStart: (e: any) => e.preventDefault(),
    onContextMenu: handleContextMenu,
  } : {};

  return (
    <Image
      source={source}
      style={[
        baseStyle,
        webSecurityStyle,
        style,
      ]}
      accessible={false}
      {...webProps}
      {...restProps}
    />
  );
}
