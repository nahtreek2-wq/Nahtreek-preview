import React from 'react';
import {StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {iconographyForService} from '../../../../packages/mobile-ui/serviceIconography';
import {ProColors} from '../theme/professionalTheme';

type WorkVisualKind = 'engineering' | 'service' | 'schedule' | 'message' | 'verification' | 'review' | 'location' | 'portfolio' | 'notification' | 'offline' | 'error';

// Home-app icon language: single-tone glyphs with no tinted chip backgrounds.
// Services share one navy glyph (per-service rainbow colors are discovery-only
// in the Home app); severity keeps its text color without a filled chip.
const visuals: Record<Exclude<WorkVisualKind, 'service'>, {icon: string; color: string}> = {
  engineering: {icon: 'ruler-square-compass', color: ProColors.primary},
  schedule: {icon: 'calendar-clock-outline', color: ProColors.primary},
  message: {icon: 'message-text-outline', color: ProColors.primary},
  verification: {icon: 'file-certificate-outline', color: ProColors.accentText},
  review: {icon: 'star-circle-outline', color: ProColors.accentText},
  location: {icon: 'map-marker-radius-outline', color: ProColors.primary},
  portfolio: {icon: 'image-multiple-outline', color: ProColors.primary},
  notification: {icon: 'bell-outline', color: ProColors.primary},
  offline: {icon: 'wifi-off', color: ProColors.secondary},
  error: {icon: 'alert-circle-outline', color: ProColors.error},
};

export function WorkVisual({kind, service, size = 44}: {kind: WorkVisualKind; service?: string; size?: number}) {
  const visual = kind === 'service'
    ? {icon: iconographyForService(service ?? 'Service').icon, color: ProColors.primary}
    : visuals[kind];
  return <View accessible={false} importantForAccessibility="no" style={[styles.root, {width: size, height: size}]}>
    <MaterialCommunityIcons name={visual.icon} size={Math.round(size * 0.53)} color={visual.color} />
  </View>;
}

const styles = StyleSheet.create({root: {alignItems: 'center', justifyContent: 'center'}});
