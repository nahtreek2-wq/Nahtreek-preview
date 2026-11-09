import React from 'react';
import {View, Text, Image, StyleSheet, StatusBar, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing} from '@nahtreek/design-system';
import {Icon, ICONS} from './Icon';
import {headerStyles} from '../../../../../packages/mobile-ui/headerStyles';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showLogo?: boolean;
  compact?: boolean;
  tab?: boolean;
}

export function AppHeader({title, subtitle, left, right, onBack, children, style, showLogo = false, compact = false, tab = false}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const navigate = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigation.navigate('Home');
  };
  return (
    <View style={[styles.container, (compact || tab) && styles.compactContainer, {paddingTop: insets.top + Spacing.sm}, style]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyDeep} />
      <View style={[styles.topLine, styles.noWrap]}>
        <View style={[styles.leading, styles.noWrapLeading]}>
          {!tab && <TouchableOpacity style={styles.back} onPress={navigate} accessibilityLabel={onBack ? 'Go back' : 'Go to Home'} accessibilityRole="button">
            <Icon name={onBack ? ICONS.back : ICONS.home} size={24} color={Colors.white} />
          </TouchableOpacity>}
          {left}
          {(showLogo && compact) || tab ? <View style={styles.logoFrame} accessibilityRole="image" accessibilityLabel="NAHTREEK logo"><Image source={require('../../assets/nahtreek_home_mark.png')} style={styles.logo} /></View> : null}
          {!!title && <Text numberOfLines={compact || tab ? 1 : 2} adjustsFontSizeToFit minimumFontScale={0.55} accessibilityRole="header" style={[styles.title, styles.refinedTitle, compact && styles.compactTitle]}>{title}</Text>}
          {showLogo && !compact && !tab ? <View style={styles.logoFrame} accessibilityRole="image" accessibilityLabel="NAHTREEK logo"><Image source={require('../../assets/nahtreek_home_mark.png')} style={styles.logo} /></View> : null}
        </View>
        <View style={styles.actions}>
          {right}
        </View>
      </View>
      {subtitle ? (
        <View style={styles.titles}>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: headerStyles.container,
  compactContainer: {paddingBottom: Spacing.md},
  topLine: headerStyles.row,
  noWrap: {flexWrap: 'nowrap'},
  leading: headerStyles.leading,
  noWrapLeading: {flexBasis: 0, flexWrap: 'nowrap', gap: Spacing.sm},
  actions: headerStyles.actions,
  back: headerStyles.navigation,
  titles: headerStyles.copy,
  title: headerStyles.title,
  refinedTitle: {fontSize: 23, lineHeight: 29, color: Colors.white},
  compactTitle: {fontSize: 20, lineHeight: 26, color: Colors.white},
  subtitle: {...headerStyles.subtitle, fontSize: 14, lineHeight: 20},
  logoFrame: {width: 32, height: 32, flexShrink: 0},
  logo: {width: 32, height: 32, resizeMode: 'contain'},
});
