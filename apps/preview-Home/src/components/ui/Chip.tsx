import React from 'react';
import {Animated, ScrollView, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Colors, Typography, BorderRadius, Spacing} from '@nahtreek/design-system';
import {ClientColors} from '../../design-system/tokens';
import {usePressMotion} from '../../../../../packages/mobile-ui/usePressMotion';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({label, selected, onPress}: ChipProps) {
  const motion = usePressMotion(!onPress);
  return (
    <AnimatedTouchable
      style={[styles.chip, selected && styles.chipSelected, motion.style]}
      onPress={onPress}
      onPressIn={motion.onPressIn}
      onPressOut={motion.onPressOut}
      accessibilityRole="button"
      accessibilityState={{selected: Boolean(selected)}}
      activeOpacity={0.7}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </AnimatedTouchable>
  );
}

export function ChipRow({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map(item => (
        <Chip
          key={item}
          label={item}
          selected={item === selected}
          onPress={() => onSelect(item)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  chipSelected: {
    backgroundColor: Colors.surface,
    borderColor: ClientColors.accent,
    borderWidth: 2,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.slate600,
  },
  labelSelected: {
    color: Colors.navyDeep,
  },
});
