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
  rfSize = 200,
  aspectRatio = 1.0,
  style,
  customWidth,
  customHeight,
  ...restProps
}: ThemedImageProps) {
  // Calculate responsive dimensions
  const responsiveWidth = customWidth || RFValue(rfSize);
  const responsiveHeight = customHeight || responsiveWidth * aspectRatio;

  return (
    <Image
      source={source}
      style={[
        {
          width: responsiveWidth,
          height: responsiveHeight,
          resizeMode: 'contain',
        },
        style,
      ]}
      accessible={false}
      {...restProps}
    />
  );
}
