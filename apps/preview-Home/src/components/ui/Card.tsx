import React from 'react';
import {View, TouchableOpacity, Animated, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {Colors, BorderRadius, Spacing} from '@nahtreek/design-system';
import {usePressMotion} from '../../../../../packages/mobile-ui/usePressMotion';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}

export function Card({children, style, onPress, padded = true}: CardProps) {
  const motion = usePressMotion(!onPress);
  const Wrapper = onPress ? AnimatedTouchable : View;
  return (
    <Wrapper
      style={[styles.card, padded && styles.padded, style, onPress && motion.style]}
      onPress={onPress}
      onPressIn={onPress ? motion.onPressIn : undefined}
      onPressOut={onPress ? motion.onPressOut : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      activeOpacity={onPress ? 0.7 : 1}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  padded: {
    padding: Spacing.md,
  },
});
