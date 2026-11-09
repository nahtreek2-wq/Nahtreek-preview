import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Keyboard, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BorderRadius, Colors, Spacing, Typography} from '@nahtreek/design-system';
import {ProToastItem, ProToastKind, useProToastStore} from '../stores/proToast';
import {navigationRef} from '../navigation/navRef';
import {useReducedMotion} from '../../../../packages/mobile-ui/useReducedMotion';

const DURATIONS: Record<ProToastKind, number> = {
  success: 2800,
  info: 3400,
  warning: 4000,
  error: 4800,
};

export function ProToast() {
  const current = useProToastStore(s => s.current);
  const hide = useProToastStore(s => s.hide);
  const insets = useSafeAreaInsets();
  const {fontScale} = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', event => setKeyboardHeight(event.endCoordinates.height));
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {shown.remove(); hidden.remove();};
  }, []);
  if (!current) return null;
  // Mirror the tab bar height formula in RootNavigator so the toast parks just
  // above the tabs on tab screens and near the bottom edge elsewhere.
  const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
  const onTabRoute = rootState?.routes[rootState.index]?.name === 'Main';
  const tabOffset = 68 + Math.max(insets.bottom, 2) + Math.max(0, fontScale - 1) * 24 + 10 + Spacing.sm;
  const restOffset = insets.bottom + Spacing.md;
  return (
    <ToastCard
      item={current}
      bottom={Math.max(onTabRoute ? tabOffset : restOffset, keyboardHeight + Spacing.sm)}
      onDismiss={() => hide(current.id)}
    />
  );
}

function ToastCard({
  item,
  bottom,
  onDismiss,
}: {
  item: ProToastItem;
  bottom: number;
  onDismiss: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(24)).current;
  const dismiss = useCallback(() => onDismiss(), [onDismiss]);
  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      offset.setValue(0);
    } else {
      Animated.parallel([
        Animated.timing(opacity, {toValue: 1, duration: 160, useNativeDriver: true}),
        Animated.spring(offset, {toValue: 0, damping: 20, stiffness: 260, useNativeDriver: true}),
      ]).start();
    }
    const timer = setTimeout(() => {
      if (reducedMotion) {
        dismiss();
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, {toValue: 0, duration: 140, useNativeDriver: true}),
        Animated.timing(offset, {toValue: 12, duration: 140, useNativeDriver: true}),
      ]).start(({finished}) => {
        if (finished) dismiss();
      });
    }, DURATIONS[item.kind]);
    return () => clearTimeout(timer);
  }, [dismiss, item.id, item.kind, offset, opacity, reducedMotion]);
  const tone =
    item.kind === 'success'
      ? Colors.success
      : item.kind === 'error'
      ? Colors.error
      : item.kind === 'warning'
      ? Colors.warning
      : Colors.navyMid;
  const icon =
    item.kind === 'success'
      ? 'check'
      : item.kind === 'error'
      ? 'close'
      : 'alert-circle-outline';
  const heading = item.kind === 'success' ? 'Done' : item.kind === 'error' ? 'Something went wrong' : item.kind === 'warning' ? 'Please check' : 'Update';
  return (
    <View style={[styles.wrap, {bottom}]} pointerEvents="box-none">
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[styles.toast, {opacity, transform: [{translateY: offset}]}]}>
        <View style={[styles.icon, {backgroundColor: tone + '18'}]}>
          <MaterialCommunityIcons name={icon} size={18} color={tone} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onDismiss} style={styles.copy}>
          <Text style={[styles.heading, {color: tone}]}>{heading}</Text>
          <Text style={styles.label} numberOfLines={3}>{item.message}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={10}
          onPress={onDismiss}
          style={styles.close}>
          <MaterialCommunityIcons name="close" size={18} color={Colors.slate500} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute', left: Spacing.md, right: Spacing.md, zIndex: 50},
  toast: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate200,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.navyDeep,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {flex: 1},
  heading: {fontSize: 12, fontWeight: '800', marginBottom: 2},
  label: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.slate800,
  },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
