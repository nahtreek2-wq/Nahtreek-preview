import React from 'react';
import {Animated, Pressable, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '@nahtreek/design-system';
import {ScreenHeader} from '../components/ScreenHeader';
import {NotificationPreferences} from '../../../../packages/mobile-push/NotificationPreferences';
import {api} from '../services/apiClient';
import {ScrollMotionBar, useScrollMotion} from '../components/ScrollMotionBar';
type Preferences = {
  requestUpdates: boolean;
  messages: boolean;
  offers: boolean;
};
const load = () => api.get<Preferences>('/notifications/preferences');
const save = (value: Partial<Preferences>) =>
  api.patch<Preferences>('/notifications/preferences', value);
export function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const scrollMotion = useScrollMotion();
  return (
    <View style={{flex: 1, backgroundColor: Colors.offWhite}}>
      <ScreenHeader
        title="Notification settings"
        subtitle="Choose the updates you receive"
        onBack={() => navigation.goBack()}
      />
      <ScrollMotionBar offset={scrollMotion.offset} reducedMotion={scrollMotion.reducedMotion} />
      <Animated.ScrollView
        onScroll={scrollMotion.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{padding: 20, paddingBottom: 48, gap: 24}}>
        <NotificationPreferences load={load} save={save} />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={{
            minHeight: 52,
            borderRadius: 16,
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.slate200,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: Colors.navyDeep,
              fontSize: 15,
              lineHeight: 22,
              fontWeight: '700',
            }}>
            Back to profile
          </Text>
        </Pressable>
      </Animated.ScrollView>
    </View>
  );
}
