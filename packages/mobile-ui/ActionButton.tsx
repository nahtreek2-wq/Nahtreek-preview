import React from 'react';
import {ActivityIndicator, Animated, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {BorderRadius, Colors, Spacing, Typography} from '@nahtreek/design-system';
import {usePressMotion} from './usePressMotion';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

// Loading keeps the action visible and prevents repeat taps without implying success.
export function ActionButton({label, onPress, variant = 'primary', loading = false, loadingLabel, disabled = false, style, icon}: ActionButtonProps) {
  const inactive = disabled || loading;
  const motion = usePressMotion(inactive);
  const textColor = disabled ? Colors.slate600 : variant === 'danger' ? Colors.error : Colors.navyDeep;
  return (
    <AnimatedTouchable
      accessibilityRole="button"
      accessibilityLabel={loading ? loadingLabel || `${label}, in progress` : label}
      accessibilityState={{disabled: inactive, busy: loading}}
      disabled={inactive}
      onPress={onPress}
      onPressIn={motion.onPressIn}
      onPressOut={motion.onPressOut}
      activeOpacity={0.8}
      style={[styles.base, styles[variant], style, disabled && styles.disabled, motion.style]}>
      {loading ? <ActivityIndicator accessible={false} color={textColor} /> : icon}
      <Text style={[styles.label, {color: textColor}]}>{loading && loadingLabel ? loadingLabel : label}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {minHeight: 48, flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md, paddingVertical: 12, paddingHorizontal: Spacing.lg, gap: 8},
  primary: {backgroundColor: Colors.amber},
  accent: {backgroundColor: Colors.amber},
  secondary: {backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.slate300},
  danger: {backgroundColor: Colors.errorBg},
  disabled: {backgroundColor: Colors.slate200, borderColor: Colors.slate200},
  label: {...Typography.button, flexShrink: 1, textAlign: 'center'},
});
