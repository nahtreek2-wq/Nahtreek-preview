import React, {useEffect, useRef} from 'react';
import {Animated, StatusBar, StyleSheet} from 'react-native';
import {BrandLogoReveal} from '../../../../packages/mobile-ui/BrandLogoReveal';
import {useReducedMotion} from '../../../../packages/mobile-ui/useReducedMotion';
import {BRAND} from '../theme/brand';

const MINIMUM_SPLASH_MS = 800;

interface SplashScreenProps {
  isReady?: boolean;
  onFinish: () => void;
}

export function SplashScreen({isReady = false, onFinish}: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const startedAt = useRef(Date.now());
  const finished = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isReady) return;
    const remaining = reducedMotion ? 0 : Math.max(
      0,
      MINIMUM_SPLASH_MS - (Date.now() - startedAt.current),
    );
    const timer = setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      if (reducedMotion) {
        onFinish();
        return;
      }
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(({finished: didFinish}) => {
        if (didFinish) onFinish();
      });
    }, remaining);
    return () => clearTimeout(timer);
  }, [isReady, onFinish, opacity, reducedMotion]);

  return (
    <Animated.View style={[styles.root, {opacity}]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND.splashBackground} />
      <BrandLogoReveal
        mark={require('../assets/nahtreek_home_mark.png')}
        name={BRAND.name}
        product="HOME"
        tagline="Find the right help for your home"
        size={132}
        durationScale={0.5}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.splashBackground,
  },
});
