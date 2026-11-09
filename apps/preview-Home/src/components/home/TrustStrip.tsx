import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Typography} from '@nahtreek/design-system';
import {ICONS, Icon} from '../ui/Icon';

export function TrustStrip() {
  return (
    <View style={styles.strip} testID="home-trust-strip">
      <Icon name={ICONS.verified} size={15} color={Colors.teal} />
      <Text style={styles.text}>
        Verified pros · Secure in-app chat · Track every job
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  text: {
    ...Typography.caption,
    color: Colors.slate600,
    textAlign: 'center',
    flexShrink: 1,
  },
});
