import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography, BorderRadius, Spacing} from '@nahtreek/design-system';
import {ClientColors} from '../../design-system/tokens';
import {Icon, ICONS} from './Icon';

export function VerifiedBadge() {
  return (
    <View style={styles.badge}>
      <Icon name={ICONS.verified} size={12} color={Colors.verifiedBlue} />
      <Text style={styles.label}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ClientColors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  label: {
    ...Typography.badge,
    color: Colors.verifiedBlue,
  },
});
