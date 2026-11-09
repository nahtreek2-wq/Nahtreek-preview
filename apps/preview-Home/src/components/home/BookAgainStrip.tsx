import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import {ClientColors} from '../../design-system/tokens';
import {Icon, ICONS} from '../ui';
import {workPhotoFor} from '../../assets/imagery';

export type BookAgainItem = {
  id: string;
  title: string;
  detail: string;
};

type Props = {
  items: BookAgainItem[];
  onSelect: (id: string) => void;
};

export function BookAgainStrip({items, onSelect}: Props) {
  if (items.length === 0) {
    return null;
  }
  return (
    <View style={styles.section} testID="home-book-again">
      <Text style={styles.title}>Book again</Text>
      <Text style={styles.subtitle}>Your recent services, one tap away.</Text>
      <View style={styles.list}>
        {items.slice(0, 3).map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Book ${item.title} again`}
            onPress={() => onSelect(item.id)}
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
            <Image source={workPhotoFor(item.id)} style={styles.thumb} resizeMode="cover" />
            <View style={styles.copy}>
              <Text numberOfLines={1} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text numberOfLines={1} style={styles.cardDetail}>
                {item.detail}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Book</Text>
              <Icon name={ICONS.chevronRight} size={16} color={ClientColors.onAccent} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.slate900,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.slate600,
    marginTop: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.sm + 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate100,
    padding: Spacing.sm + 4,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: ClientColors.accent,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.slate900,
    fontWeight: '700',
  },
  cardDetail: {
    ...Typography.caption,
    color: Colors.slate500,
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: ClientColors.accent,
    borderRadius: BorderRadius.full,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    flexShrink: 0,
  },
  pillText: {
    ...Typography.button,
    color: ClientColors.onAccent,
  },
});
