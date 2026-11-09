import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography, BorderRadius, Spacing} from '@nahtreek/design-system';

export type TrackableStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'AWAITING_CONFIRMATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED';

const STATUS_STYLE: Record<TrackableStatus, {label: string; fg: string; bg: string}> = {
  DRAFT: {label: 'Draft', fg: Colors.slate600, bg: Colors.slate100},
  PENDING: {label: 'Pending', fg: Colors.warning, bg: Colors.warningBg},
  ACCEPTED: {label: 'Accepted', fg: Colors.info, bg: Colors.infoBg},
  CONFIRMED: {label: 'Confirmed', fg: Colors.info, bg: Colors.infoBg},
  EN_ROUTE: {label: 'On the way', fg: Colors.info, bg: Colors.infoBg},
  ARRIVED: {label: 'Arrived', fg: Colors.info, bg: Colors.infoBg},
  DECLINED: {label: 'Declined', fg: Colors.error, bg: Colors.errorBg},
  IN_PROGRESS: {label: 'In progress', fg: Colors.info, bg: Colors.infoBg},
  AWAITING_CONFIRMATION: {label: 'Review work', fg: Colors.warning, bg: Colors.warningBg},
  COMPLETED: {label: 'Completed', fg: Colors.success, bg: Colors.successBg},
  CANCELLED: {label: 'Cancelled', fg: Colors.slate600, bg: Colors.slate100},
  EXPIRED: {label: 'Expired', fg: Colors.slate600, bg: Colors.slate100},
  DISPUTED: {label: 'Issue reported', fg: Colors.error, bg: Colors.errorBg},
};

export function StatusBadge({status}: {status: TrackableStatus}) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  return (
    <View style={[styles.badge, {backgroundColor: s.bg}]}>
      <Text style={[styles.label, {color: s.fg}]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  label: {
    ...Typography.badge,
  },
});
