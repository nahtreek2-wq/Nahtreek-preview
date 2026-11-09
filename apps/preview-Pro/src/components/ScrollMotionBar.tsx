import React, {useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Colors} from '@nahtreek/design-system';
import {ProColors} from '../theme/professionalTheme';
import {useReducedMotion} from '../../../../packages/mobile-ui/useReducedMotion';

export function useScrollMotion() {
  const offset = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();
  const onScroll = reducedMotion ? undefined : Animated.event(
    [{nativeEvent: {contentOffset: {y: offset}}}],
    {useNativeDriver: true},
  );
  return {offset, onScroll, reducedMotion};
}

export function ScrollMotionBar({offset, reducedMotion}: {offset: Animated.Value; reducedMotion: boolean}) {
  if (reducedMotion) {
    return null;
  }
  const progress = offset.interpolate({inputRange: [0, 220], outputRange: [0, 1], extrapolate: 'clamp'});
  const scale = offset.interpolate({inputRange: [0, 220], outputRange: [0.015, 1], extrapolate: 'clamp'});
  return (
    <View pointerEvents="none" style={styles.track}>
      <Animated.View style={[styles.bar, {opacity: progress, transform: [{scaleX: scale}]}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {height: 2, backgroundColor: Colors.offWhite},
  bar: {height: 2, backgroundColor: ProColors.accent},
});
