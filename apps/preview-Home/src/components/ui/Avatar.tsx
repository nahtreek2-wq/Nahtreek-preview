import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType} from 'react-native';
import {Colors, Typography} from '@nahtreek/design-system';
import {mediaUrl} from '../../services/media';

interface AvatarProps {
  name: string;
  uri?: string;
  source?: ImageSourcePropType;
  size?: number;
  light?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({name, uri, source, size = 44, light, style}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('');
  const img = source ?? (uri ? {uri: mediaUrl(uri)} : null);
  useEffect(() => setFailed(false), [uri, source]);
  return (
    <View
      style={[
        styles.circle,
        light && styles.circleLight,
        {width: size, height: size, borderRadius: size / 2},
        style,
      ]}>
      {img && !failed ? (
        <Image
          source={img}
          style={{width: size, height: size, borderRadius: size / 2}}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.initials, light && styles.initialsLight, {fontSize: size * 0.38}]}>
          {initials || 'N'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: Colors.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleLight: {
    backgroundColor: Colors.offWhite,
  },
  initials: {
    ...Typography.h3,
    color: Colors.white,
  },
  initialsLight: {
    color: Colors.navyDeep,
  },
});
