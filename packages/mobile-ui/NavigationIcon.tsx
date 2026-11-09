import React from 'react';
import {StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Bundled font, pending the separately validated Material Symbols migration.
export const navigationGlyphs = {
  home: ['home-outline', 'home'],
  find: ['account-search-outline', 'account-search'],
  requests: ['clipboard-text-outline', 'clipboard-text'],
  jobs: ['briefcase-outline', 'briefcase'],
  schedule: ['calendar-blank-outline', 'calendar-blank'],
  messages: ['message-text-outline', 'message-text'],
  profile: ['account-circle-outline', 'account-circle'],
} as const;

export type NavigationIconName = keyof typeof navigationGlyphs;

export function NavigationIcon({name, focused, color}: {name: NavigationIconName; focused: boolean; color: string}) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.frame}>
      <MaterialCommunityIcons name={navigationGlyphs[name][focused ? 1 : 0]} size={24} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Plain glyphs only: no background pill behind any navigation icon.
  frame: {width: 48, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
});
