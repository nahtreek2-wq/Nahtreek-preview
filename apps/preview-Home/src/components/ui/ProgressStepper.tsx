import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography, Spacing} from '@nahtreek/design-system';
import {ClientColors} from '../../design-system/tokens';
import {Icon, ICONS} from './Icon';

interface ProgressStepperProps {
  steps: string[];
  currentIndex: number;
}

export function ProgressStepper({steps, currentIndex}: ProgressStepperProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`Progress: ${steps[Math.max(0, Math.min(currentIndex, steps.length - 1))] ?? 'Not started'}`}>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const active = done || current;
        return (
            <View key={step} style={styles.col}>
              {i < steps.length - 1 && <View style={[styles.line, done && styles.lineActive]} />}
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotActive]}>
                {done ? <Icon name={ICONS.check} size={12} color={Colors.white} /> : current ? <View style={styles.currentDot} /> : null}
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" allowFontScaling={false} style={[styles.label, active && styles.labelActive]}>{step}</Text>
            </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  col: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.slate200,
  },
  dotActive: {
    backgroundColor: ClientColors.accent,
  },
  dotDone: {backgroundColor: Colors.success},
  currentDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: ClientColors.onAccent},
  line: {
    position: 'absolute',
    left: '50%',
    width: '100%',
    top: 9,
    height: 2,
    backgroundColor: Colors.slate200,
  },
  lineActive: {
    backgroundColor: Colors.success,
  },
  label: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 13,
    color: Colors.slate500,
    paddingHorizontal: 2,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.slate700,
  },
});
