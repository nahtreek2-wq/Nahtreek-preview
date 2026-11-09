import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Typography} from '@nahtreek/design-system';
import {usePressMotion} from './usePressMotion';

type Props = {
  title: string;
  description: string;
  icon: string;
  color: string;
  tint: string;
  onPress: () => void;
};

// A shared task entry point: icon, clear outcome, supporting copy and affordance.
export function ActionCard({title, description, icon, color, tint, onPress}: Props) {
  const motion = usePressMotion();
  return (
    <Animated.View style={motion.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      onPressIn={motion.onPressIn}
      onPressOut={motion.onPressOut}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.icon, {backgroundColor: tint}]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="arrow-top-right" size={20} color={Colors.navyMid} />
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {minHeight: 92, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 1, borderColor: Colors.slate200, backgroundColor: Colors.surface},
  pressed: {backgroundColor: Colors.slate50, borderColor: Colors.slate400},
  icon: {width: 48, height: 48, flexShrink: 0, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1, minWidth: 0},
  title: {...Typography.h3, color: Colors.navyDeep},
  description: {...Typography.caption, color: Colors.slate500, marginTop: 4},
});
