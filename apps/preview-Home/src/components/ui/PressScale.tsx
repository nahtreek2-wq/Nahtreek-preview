import React from 'react';
import {Pressable, StyleProp, ViewStyle} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import {useReducedMotion} from '../../../../../packages/mobile-ui/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PressScale({onPress, style, children, disabled}: PressScaleProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{disabled: Boolean(disabled)}}
      onPressIn={() => {
        scale.value = reducedMotion ? 1 : withSpring(0.98, {damping: 15, stiffness: 200});
      }}
      onPressOut={() => {
        scale.value = reducedMotion ? 1 : withSpring(1, {damping: 15, stiffness: 200});
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
