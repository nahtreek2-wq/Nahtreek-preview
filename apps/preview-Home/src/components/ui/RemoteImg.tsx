import React, {useState} from 'react';
import {Image, StyleProp, ImageStyle, ImageSourcePropType, ImageResizeMode} from 'react-native';

interface RemoteImgProps {
  uri?: string;
  fallback: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}

export function RemoteImg({uri, fallback, style, resizeMode = 'cover'}: RemoteImgProps) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      source={uri && !failed ? {uri} : fallback}
      style={style}
      resizeMode={resizeMode}
      onError={uri && !failed ? () => setFailed(true) : undefined}
    />
  );
}
