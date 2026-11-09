import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import {PrimaryButton} from '../components/PrimaryButton';
import {
  useProfessionalDraft,
  type ProfessionalType,
} from '../stores/professional';
import type {RootStackParamList} from '../navigation/types';
import {ProColors, ProSpacing, ProType} from '../theme/professionalTheme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const options: {
  type: ProfessionalType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    type: 'CIVIL_ENGINEER',
    title: 'Civil Engineer',
    description:
      'Consultations, planning, inspections, supervision and engineering projects.',
    icon: 'hard-hat',
  },
  {
    type: 'SERVICE_PROFESSIONAL',
    title: 'Service Professional',
    description:
      'Home services, repairs, maintenance and construction-related skilled work.',
    icon: 'tools',
  },
];

export function ProfessionalTypeScreen() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const navigation = useNavigation<Navigation>();
  const savedType = useProfessionalDraft(state => state.professionalType);
  const selectType = useProfessionalDraft(state => state.selectType);
  const [selected, setSelected] = useState<ProfessionalType | null>(savedType);

  return (
    <View style={styles.root}>
      {focused ? (
        <StatusBar barStyle="dark-content" backgroundColor={Colors.offWhite} />
      ) : null}
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + ProSpacing.lg,
          paddingBottom: ProSpacing.lg,
        },
      ]}>
      <View style={styles.brandRow}>
        <Image
          source={require('../assets/nahtreek-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.cardCopy}>
          <Text style={styles.brand}>NAHTREEK PRO</Text>
          <Text style={styles.product}>PROFESSIONAL WORKSPACE</Text>
        </View>
      </View>
      <Text style={styles.title}>How will you use NAHTREEK?</Text>
      <Text style={styles.subtitle}>
        Choose your main type of work. You can add more approved capabilities
        later.
      </Text>
      <View style={styles.options}>
        {options.map(option => {
          const active = selected === option.type;
          return (
            <Pressable
              key={option.type}
              accessibilityRole="radio"
              accessibilityState={{checked: active}}
              onPress={() => setSelected(option.type)}
              style={({pressed}) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.pressed,
              ]}>
              <View style={styles.cardHeading}>
              <View style={[styles.icon, active && styles.iconActive]}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={28}
                  color={Colors.navyDeep}
                />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{option.title}</Text>
              </View>
              <MaterialCommunityIcons
                name={active ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={active ? Colors.navyMid : Colors.slate400}
              />
              </View>
              <Text style={styles.cardText}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>
        Your profile becomes visible after completion and approval.
      </Text>
    </ScrollView>
    <View style={[styles.footer, {paddingBottom: Math.max(insets.bottom, 12)}]}>
      <PrimaryButton
        label="Continue"
        disabled={!selected}
        onPress={() => {
          if (!selected) {
            return;
          }
          selectType(selected);
          navigation.navigate('AccountAccess');
        }}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.offWhite},
  scroll: {flex: 1},
  content: {paddingHorizontal: ProSpacing.xl},
  footer: {paddingHorizontal: ProSpacing.xl, paddingTop: 10, borderTopWidth: 1, borderTopColor: ProColors.border, backgroundColor: ProColors.surface},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.navyDeep, borderRadius: BorderRadius.lg, paddingVertical: ProSpacing.md, paddingHorizontal: ProSpacing.lg},
  logo: {width: 52, height: 52},
  brand: {...Typography.h2, color: Colors.white, letterSpacing: 0.5},
  product: {
    ...Typography.badge,
    lineHeight: 16,
    color: Colors.slate300,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  title: {...ProType.screen, color: ProColors.text, marginTop: ProSpacing.lg},
  subtitle: {...ProType.body, color: ProColors.secondary, marginTop: ProSpacing.sm},
  options: {gap: ProSpacing.md, marginVertical: ProSpacing.lg},
  cardHeading: {flexDirection: 'row', alignItems: 'center', gap: 12},
  card: {
    minHeight: 108,
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
  },
  cardActive: {
    borderColor: Colors.navyMid,
    borderWidth: 2,
    backgroundColor: ProColors.accentSoft,
  },
  pressed: {opacity: 0.86},
  icon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 17,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {backgroundColor: ProColors.accent},
  cardCopy: {flex: 1},
  cardTitle: {...Typography.h3, color: Colors.slate900},
  cardText: {...ProType.meta, color: ProColors.secondary},
  note: {
    ...Typography.caption,
    color: Colors.slate500,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
