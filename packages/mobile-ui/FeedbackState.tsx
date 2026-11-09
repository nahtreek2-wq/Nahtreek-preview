import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Spacing, Typography} from '@nahtreek/design-system';
import {ActionButton} from './ActionButton';

export interface FeedbackStateProps {
  icon?: string;
  title: string;
  message: string;
  tone?: 'empty' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export function FeedbackState({icon = 'clipboard-search-outline', title, message, tone = 'empty', actionLabel, onAction}: FeedbackStateProps) {
  const error = tone === 'error';
  return (
    <View style={styles.root}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.icon, {backgroundColor: error ? Colors.errorBg : Colors.infoBg}]}>
        <MaterialCommunityIcons name={icon} size={28} color={error ? Colors.error : Colors.info} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text accessibilityLiveRegion={error ? 'polite' : 'none'} style={styles.message}>{message}</Text>
      {actionLabel && onAction ? <ActionButton variant="secondary" label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl},
  icon: {width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md},
  title: {...Typography.h3, color: Colors.slate900, textAlign: 'center', marginBottom: 8},
  message: {...Typography.body, color: Colors.slate600, textAlign: 'center', maxWidth: 340},
  action: {marginTop: Spacing.lg, alignSelf: 'stretch'},
});
