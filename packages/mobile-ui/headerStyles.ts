import {StyleSheet} from 'react-native';
import {Colors, Spacing, Typography} from '@nahtreek/design-system';

// Shared non-home header rhythm. Safe-area padding is applied by each app.
export const headerStyles = StyleSheet.create({
  container: {backgroundColor: Colors.navyDeep, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24},
  row: {minHeight: 56, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm},
  leading: {flexGrow: 1, flexShrink: 1, flexBasis: 180, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12},
  actions: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexShrink: 0},
  navigation: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  title: {...Typography.h1, color: Colors.amber, flex: 1, minWidth: 0},
  copy: {minWidth: 0, marginTop: Spacing.sm},
  subtitle: {...Typography.body, color: Colors.slate300},
});
