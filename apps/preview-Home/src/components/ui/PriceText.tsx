import React from 'react';
import {Text, StyleSheet, StyleProp, TextStyle} from 'react-native';
import {Colors, Typography, IndiaLocale} from '@nahtreek/design-system';

interface PriceTextProps {
  amount: number;
  unit?: string;
  style?: StyleProp<TextStyle>;
}

export function PriceText({amount, unit, style}: PriceTextProps) {
  return (
    <Text style={[styles.price, style]}>
      {IndiaLocale.formatCurrency(amount)}
      {unit ? <Text style={styles.unit}>/{unit}</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  price: {
    ...Typography.h3,
    color: Colors.navyDeep,
    fontWeight: '700',
  },
  unit: {
    ...Typography.caption,
    color: Colors.slate500,
    fontWeight: '500',
  },
});
