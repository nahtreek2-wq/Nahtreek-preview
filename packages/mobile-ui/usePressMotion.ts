import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useReducedMotion} from './useReducedMotion';

export function usePressMotion(disabled = false) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    scale.stopAnimation();
    scale.setValue(1);
    return () => scale.stopAnimation();
  }, [disabled, reducedMotion, scale]);

  const animate = (pressed: boolean) => {
    if (disabled || reducedMotion) {
      return;
    }
    Animated.spring(scale, {
      toValue: pressed ? 0.98 : 1,
      speed: 28,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  return {
    style: {transform: [{scale}]},
    onPressIn: () => animate(true),
    onPressOut: () => animate(false),
  };
}
