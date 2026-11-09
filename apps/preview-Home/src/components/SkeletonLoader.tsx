import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions, Easing} from 'react-native';
import {Colors, BorderRadius, Spacing} from '@nahtreek/design-system';
import LinearGradient from 'react-native-linear-gradient';
import {useReducedMotion} from '../../../../packages/mobile-ui/useReducedMotion';

const {width: SCREEN_W} = Dimensions.get('window');

/* ── Shimmer skeleton bar with animated gradient sweep ── */

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonItem({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {shimmer.setValue(0); return;}
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer, reducedMotion]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W, SCREEN_W],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E6EAF0',
          overflow: 'hidden',
        },
        style,
      ]}>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{translateX}],
        }}>
        <LinearGradient
          colors={['#E6EAF0', '#F7F9FC', '#FFFFFF', '#F7F9FC', '#E6EAF0']}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={{flex: 1}}
        />
      </Animated.View>
    </View>
  );
}

/* ── Individual card skeletons ── */

export function EngineerCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.row}>
        <SkeletonItem width={50} height={50} borderRadius={25} />
        <View style={{flex: 1, marginLeft: Spacing.md}}>
          <SkeletonItem width="60%" height={18} />
          <SkeletonItem width="40%" height={14} style={{marginTop: 6}} />
        </View>
      </View>
      <SkeletonItem
        width="100%"
        height={120}
        borderRadius={BorderRadius.md}
        style={{marginTop: Spacing.md}}
      />
    </View>
  );
}

export function ProviderCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.row}>
        <SkeletonItem width={44} height={44} borderRadius={22} />
        <View style={{flex: 1, marginLeft: Spacing.md}}>
          <SkeletonItem width="55%" height={16} />
          <SkeletonItem width="35%" height={12} style={{marginTop: 6}} />
        </View>
        <SkeletonItem width={64} height={20} borderRadius={BorderRadius.full} />
      </View>
      <SkeletonItem width="100%" height={14} style={{marginTop: Spacing.md}} />
      <View
        style={[
          styles.row,
          {marginTop: Spacing.sm, justifyContent: 'space-between'},
        ]}>
        <SkeletonItem width="30%" height={16} />
        <SkeletonItem width="25%" height={16} />
      </View>
    </View>
  );
}

/* ── Full-page Home skeleton: mirrors exact HomeScreen layout ── */

export function HomeSkeleton() {
  return (
    <View style={styles.homeSkeleton}>
      {/* Hero carousel placeholder */}
      <SkeletonItem
        width="100%"
        height={200}
        borderRadius={BorderRadius.xl}
        style={{marginBottom: Spacing.md}}
      />

      {/* Carousel dots */}
      <View style={styles.dotsRow}>
        <SkeletonItem width={20} height={6} borderRadius={3} />
        <SkeletonItem
          width={6}
          height={6}
          borderRadius={3}
          style={{marginLeft: 6}}
        />
        <SkeletonItem
          width={6}
          height={6}
          borderRadius={3}
          style={{marginLeft: 6}}
        />
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <SkeletonItem width="28%" height={56} borderRadius={BorderRadius.lg} />
        <SkeletonItem width="28%" height={56} borderRadius={BorderRadius.lg} />
        <SkeletonItem width="28%" height={56} borderRadius={BorderRadius.lg} />
      </View>

      {/* Section title */}
      <SkeletonItem
        width="55%"
        height={20}
        style={{marginBottom: Spacing.md, marginTop: Spacing.sm}}
      />

      {/* Category grid (2x2) */}
      <View style={styles.categoryGrid}>
        <SkeletonItem
          width="48%"
          height={90}
          borderRadius={BorderRadius.lg}
        />
        <SkeletonItem
          width="48%"
          height={90}
          borderRadius={BorderRadius.lg}
        />
      </View>
      <View style={styles.categoryGrid}>
        <SkeletonItem
          width="48%"
          height={90}
          borderRadius={BorderRadius.lg}
        />
        <SkeletonItem
          width="48%"
          height={90}
          borderRadius={BorderRadius.lg}
        />
      </View>

      {/* Provider cards */}
      <SkeletonItem
        width="48%"
        height={18}
        style={{marginTop: Spacing.lg, marginBottom: Spacing.md}}
      />
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeSkeleton: {
    paddingHorizontal: 0,
    paddingTop: Spacing.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
});
