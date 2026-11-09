import React from 'react';
import {ActivityIndicator, Animated, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {BorderRadius, Colors, Spacing, Typography} from '@nahtreek/design-system';
import {usePressMotion} from '../../../../../packages/mobile-ui/usePressMotion';
import {ClientColors} from '../../design-system/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface ClientButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

// Home-app action button: same behavior and API as the shared ActionButton,
// but primary actions use the client yellow accent with navy text.
export function ClientButton({label, onPress, variant = 'primary', loading = false, loadingLabel, disabled = false, style, icon}: ClientButtonProps) {
  const inactive = disabled || loading;
  const motion = usePressMotion(inactive);
  const textColor =
    disabled ? Colors.slate600 : variant === 'danger' ? Colors.error : variant === 'secondary' ? Colors.navyDeep : ClientColors.onAccent;
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
  primary: {backgroundColor: ClientColors.accent},
  accent: {backgroundColor: ClientColors.accent},
  secondary: {backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.slate300},
  danger: {backgroundColor: Colors.errorBg},
  disabled: {backgroundColor: Colors.slate200, borderColor: Colors.slate200},
  label: {...Typography.button, flexShrink: 1, textAlign: 'center'},
});
