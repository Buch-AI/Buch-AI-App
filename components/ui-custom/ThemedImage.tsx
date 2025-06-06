import React from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';
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

  return (
    <Image
      source={source}
      style={[
        baseStyle,
        style,
      ]}
      accessible={false}
      {...restProps}
    />
  );
}
