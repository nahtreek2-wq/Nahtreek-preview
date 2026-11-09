import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {BorderRadius, Colors, Spacing, Typography} from '@nahtreek/design-system';
import {useReducedMotion} from '../../../../packages/mobile-ui/useReducedMotion';

export function ScreenLoading({label = 'Loading your workspace…', rows = 3, variant = 'list'}: {label?: string; rows?: number; variant?: 'list' | 'dashboard'}) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) {opacity.setValue(0.8); return;}
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, {toValue: 0.95, duration: 900, useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 0.55, duration: 900, useNativeDriver: true}),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity, reducedMotion]);
  return <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={label}>
    <Text accessibilityLiveRegion="polite" style={styles.label}>{label}</Text>
    {variant === 'dashboard' ? <Animated.View style={[styles.overview, {opacity}]}>{[0, 1, 2].map(index => <View key={index} style={styles.overviewCell}><View style={styles.overviewIcon} /><View style={styles.overviewValue} /><View style={styles.overviewCaption} /></View>)}</Animated.View> : null}
    {Array.from({length: variant === 'dashboard' ? Math.min(rows, 2) : rows}, (_, index) => <Animated.View key={index} style={[styles.card, {opacity}]}><View style={styles.icon} /><View style={styles.copy}><View style={[styles.title, index % 2 ? styles.titleShort : null]} /><View style={styles.line} /><View style={styles.shortLine} /></View></Animated.View>)}
  </View>;
}

const styles = StyleSheet.create({
  root: {flex: 1, padding: Spacing.lg, backgroundColor: Colors.offWhite}, label: {...Typography.caption, color: Colors.slate600, marginBottom: Spacing.md},
  overview: {minHeight: 112, flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate200, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, paddingVertical: 14},
  overviewCell: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  overviewIcon: {width: 22, height: 22, borderRadius: 7, backgroundColor: Colors.slate100},
  overviewValue: {width: 30, height: 18, borderRadius: 8, backgroundColor: Colors.slate200},
  overviewCaption: {width: '65%', height: 11, borderRadius: 6, backgroundColor: Colors.slate100},
  card: {minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate200},
  icon: {width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.slate100}, copy: {flex: 1, gap: Spacing.sm}, title: {width: '62%', height: 15, borderRadius: 8, backgroundColor: Colors.slate200}, titleShort: {width: '44%'}, line: {width: '92%', height: 11, borderRadius: 6, backgroundColor: Colors.slate100}, shortLine: {width: '48%', height: 11, borderRadius: 6, backgroundColor: Colors.slate100},
});
