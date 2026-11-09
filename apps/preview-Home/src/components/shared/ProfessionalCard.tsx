import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius} from '@nahtreek/design-system';
import {Avatar, Icon, ICONS, RatingStars} from '../ui';

interface ProfessionalCardProps {
  name: string;
  avatarUrl?: string;
  avatarSource?: ImageSourcePropType;
  sub: string;
  rating: number;
  reviews: number;
  verified: boolean;
  priceLabel: string;
  onPress: () => void;
}

export function ProfessionalCard({name, avatarUrl, avatarSource, sub, rating, reviews, verified, priceLabel, onPress}: ProfessionalCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open profile of ${name}`}>
      <View style={styles.card}>
        <Avatar name={name} size={46} uri={avatarUrl} source={avatarUrl ? undefined : avatarSource} />
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {verified && <Icon name={ICONS.verified} size={15} color={Colors.teal} />}
          </View>
          <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
          <RatingStars rating={rating} count={reviews} />
          <Text style={styles.price}>{priceLabel}</Text>
        </View>
        <Icon name={ICONS.chevronRight} size={16} color={Colors.slate300} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate100,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  name: {
    ...Typography.subtitle,
    fontWeight: '700',
    color: Colors.slate900,
    flexShrink: 1,
  },
  sub: {
    ...Typography.caption,
    color: Colors.slate500,
  },
  price: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.navyDeep,
  },
});
