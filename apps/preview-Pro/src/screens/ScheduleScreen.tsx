import React, {useState} from 'react';
import {
  Animated,
  Alert,
  NativeModules,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useBottomTabBarHeight, type BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import {ScreenHeader} from '../components/ScreenHeader';
import {EmptyState} from '../components/EmptyState';
import {KeyboardAwareView} from '../../../../packages/mobile-ui/KeyboardAwareView';
import {VerificationGate} from '../components/VerificationGate';
import type {MainTabParamList} from '../navigation/types';
import {api, ApiError} from '../services/apiClient';
import {ScreenLoading} from '../components/ScreenLoading';
import {MotionReveal} from '../components/MotionReveal';
import {ScrollMotionBar, useScrollMotion} from '../components/ScrollMotionBar';
import {useSessionStore} from '../stores/session';
import {useProToast} from '../stores/proToast';
import {ProColors, ProType} from '../theme/professionalTheme';

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
};
type Availability = {isAvailable: boolean; slots: Slot[]};

function futureSlot(days: number, startHour: number, endHour: number) {
  const start = new Date();
  start.setDate(start.getDate() + days);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(endHour, 0, 0, 0);
  return {startsAt: start.toISOString(), endsAt: end.toISOString()};
}

function customSlot(dayText: string, startText: string, endText: string) {
  const dateParts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dayText.trim());
  const startParts = /^(\d{1,2}):(\d{2})$/.exec(startText.trim());
  const endParts = /^(\d{1,2}):(\d{2})$/.exec(endText.trim());
  if (!dateParts || !startParts || !endParts) {return null;}
  const day = Number(dateParts[1]); const month = Number(dateParts[2]); const year = Number(dateParts[3]);
  const startHour = Number(startParts[1]); const startMinute = Number(startParts[2]);
  const endHour = Number(endParts[1]); const endMinute = Number(endParts[2]);
  if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59) {return null;}
  const start = new Date(year, month - 1, day, startHour, startMinute);
  const end = new Date(year, month - 1, day, endHour, endMinute);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day || start <= new Date() || end <= start) {return null;}
  return {startsAt: start.toISOString(), endsAt: end.toISOString()};
}

export function ScheduleScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollMotion = useScrollMotion();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const queryClient = useQueryClient();
  const toast = useProToast();
  const [customOpen, setCustomOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customError, setCustomError] = useState('');
  const serviceProvider = useSessionStore(state =>
    state.user?.roles.includes('SERVICE_PROVIDER'),
  );
  const profile = useQuery({
    queryKey: ['professional-profile'],
    queryFn: () => api.get<{profile: {verificationStatus: string} | null}>('/professionals/me'),
  });
  const verificationStatus = profile.data?.profile?.verificationStatus;
  const locked = Boolean(profile.data) && verificationStatus !== 'VERIFIED';
  const underReview = verificationStatus === 'UNDER_REVIEW' || verificationStatus === 'PENDING';
  const goVerify = () =>
    navigation.navigate('Profile', {
      screen:
        verificationStatus === 'UNDER_REVIEW' ||
        verificationStatus === 'PENDING' ||
        verificationStatus === 'REJECTED'
          ? 'VerificationDocuments'
          : 'ProfessionalSetup',
    });
  const availability = useQuery({
    queryKey: ['professional-availability'],
    queryFn: () => api.get<Availability>('/professionals/me/availability'),
  });
  const refresh = () =>
    queryClient.invalidateQueries({queryKey: ['professional-availability']});
  const create = useMutation({
    mutationFn: (slot: {startsAt: string; endsAt: string}) =>
      api.post('/professionals/me/availability', slot),
    onSuccess: () => {setCustomOpen(false); setCustomError(''); refresh(); toast('Time slot added.', 'success');},
    onError: error => {toast(error instanceof Error ? error.message : 'Could not add this slot.', 'error');},
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/professionals/me/availability/${id}`),
    onSuccess: () => {refresh(); toast('Time slot removed.', 'success');},
    onError: error => {toast(error instanceof Error ? error.message : 'Could not remove this slot.', 'error');},
  });
  const status = useMutation({
    mutationFn: (isAvailable: boolean) =>
      api.patch<{isAvailable: boolean; retainLocationSharing?: boolean}>('/professionals/me/work-status', {isAvailable}),
    onSuccess: (result, isAvailable) => {
      if (serviceProvider && Platform.OS === 'android' && !isAvailable && !result.retainLocationSharing) {
        NativeModules.NahtreekRuntimeConfig.stopLiveLocation().catch(() => undefined);
      }
      toast(isAvailable ? "You're open for new work." : 'New work paused.', 'success');
      return refresh();
    },
    onError: error => {
      toast(error instanceof Error ? error.message : 'Could not update availability.', 'error');
    },
  });
  const presets = [
    {
      label: 'Tomorrow morning',
      detail: '9:00 AM – 12:00 PM',
      slot: futureSlot(1, 9, 12),
    },
    {
      label: 'Tomorrow afternoon',
      detail: '2:00 PM – 5:00 PM',
      slot: futureSlot(1, 14, 17),
    },
    {
      label: 'Day after tomorrow',
      detail: '9:00 AM – 12:00 PM',
      slot: futureSlot(2, 9, 12),
    },
  ];
  const error = create.error ?? remove.error ?? status.error;
  const today = new Date().toDateString();
  const todaySlots = availability.data?.slots.filter(slot => slot.isAvailable && new Date(slot.startsAt).toDateString() === today && new Date(slot.endsAt) > new Date()) ?? [];
  const addCustom = () => {
    const slot = customSlot(customDate, customStart, customEnd);
    if (!slot) {setCustomError('Enter a future date (DD/MM/YYYY) and a valid time range (HH:MM).'); return;}
    setCustomError('');
    create.mutate(slot);
  };
  return (
    <KeyboardAwareView style={styles.root}>
      <ScreenHeader
        title={serviceProvider ? 'My availability' : 'My time'}
        subtitle={
          serviceProvider
            ? 'Set the times when you can accept work'
            : 'Your work days and times'
        }
      />
      <ScrollMotionBar offset={scrollMotion.offset} reducedMotion={scrollMotion.reducedMotion} />
      {locked ? (
        <VerificationGate
          feature="time"
          underReview={underReview}
          onVerify={goVerify}
          bottomPadding={tabBarHeight + 24}
        />
      ) : (
      <>
      {availability.isPending ? (
        <ScreenLoading label="Loading your availability…" />
      ) : null}
      {availability.isError ? (
        <View style={styles.content}>
          <EmptyState
            icon="cloud-off-outline"
            title="Schedule could not load"
            message={
              availability.error instanceof ApiError
                ? availability.error.message
                : 'Check your connection and try again.'
            }
          />
          <Pressable
            onPress={() => availability.refetch()}
            style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {availability.data ? (
        <MotionReveal style={styles.contentContainer}>
        <Animated.ScrollView
          onScroll={scrollMotion.onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={availability.isRefetching}
              onRefresh={availability.refetch}
              colors={[Colors.navyMid]}
            />
          }
          contentContainerStyle={[styles.content, {paddingBottom: tabBarHeight + Spacing.xxl}]}>
          <View style={styles.statusCard}>
            <View style={styles.statusTop}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons
                name={
                  availability.data.isAvailable
                    ? 'briefcase-check-outline'
                    : 'pause-circle-outline'
                }
                size={24}
                color={
                  availability.data.isAvailable
                    ? Colors.success
                    : Colors.warning
                }
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                {availability.data.isAvailable
                  ? 'Open to new work'
                  : 'New work paused'}
              </Text>
              <Text style={styles.muted}>
                {availability.data.isAvailable
                  ? 'Clients can match with your approved profile.'
                  : 'Existing work stays visible; new matching is paused.'}
              </Text>
            </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{disabled: status.isPending}}
              disabled={status.isPending}
              onPress={() => status.mutate(!availability.data.isAvailable)}
              style={styles.toggle}>
              <Text style={styles.toggleText}>
                {status.isPending ? 'Saving…' : availability.data.isAvailable ? 'Pause' : 'Resume'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.todayLine}><MaterialCommunityIcons name="calendar-today" size={20} color={ProColors.primary} /><View style={styles.flex}><Text style={styles.todayLineTitle}>Available today</Text><Text style={styles.muted}>{todaySlots.length ? `${todaySlots.length} ${todaySlots.length === 1 ? 'time slot' : 'time slots'} remaining` : 'No available time left today'}</Text></View></View>
          <Text style={styles.sectionTitle}>Add available time</Text>
          <Text style={styles.sectionHelp}>
            {serviceProvider
              ? 'Choose a time when you can accept a service job.'
              : 'Add a time you can offer for upcoming work.'}
          </Text>
          <View style={styles.presetList}>
            {presets.map(item => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityState={{disabled: create.isPending}}
                disabled={create.isPending}
                onPress={() => create.mutate(item.slot)}
                style={({pressed}) => [
                  styles.preset,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.presetIcon}>
                  <MaterialCommunityIcons
                    name="calendar-plus"
                    size={21}
                    color={Colors.navyDeep}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.presetTitle}>{item.label}</Text>
                  <Text style={styles.muted}>{item.detail}</Text>
                </View>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={Colors.navyDeep}
                />
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" accessibilityState={{expanded: customOpen}} onPress={() => setCustomOpen(open => !open)} style={styles.customToggle}>
            <MaterialCommunityIcons name="calendar-edit" size={22} color={ProColors.primary} /><Text style={styles.customToggleText}>Choose another date and time</Text><MaterialCommunityIcons name={customOpen ? 'chevron-up' : 'chevron-down'} size={20} color={ProColors.primary} />
          </Pressable>
          {customOpen ? <View style={styles.customForm}>
            <Text style={styles.customHelp}>Use your device’s local time. Example: 14/10/2026, 09:00 to 12:00.</Text>
            <TextInput accessibilityLabel="Available date, day month year" placeholder="DD/MM/YYYY" placeholderTextColor={ProColors.muted} keyboardType="numbers-and-punctuation" value={customDate} onChangeText={setCustomDate} style={styles.customInput} />
            <View style={styles.customTimes}><TextInput accessibilityLabel="Start time" placeholder="Start HH:MM" placeholderTextColor={ProColors.muted} keyboardType="numbers-and-punctuation" value={customStart} onChangeText={setCustomStart} style={[styles.customInput, styles.customTime]} /><TextInput accessibilityLabel="End time" placeholder="End HH:MM" placeholderTextColor={ProColors.muted} keyboardType="numbers-and-punctuation" value={customEnd} onChangeText={setCustomEnd} style={[styles.customInput, styles.customTime]} /></View>
            {customError ? <Text accessibilityRole="alert" style={styles.error}>{customError}</Text> : null}
            <Pressable accessibilityRole="button" disabled={create.isPending} onPress={addCustom} style={styles.customSave}><Text style={styles.customSaveText}>{create.isPending ? 'Saving…' : 'Add available time'}</Text></Pressable>
          </View> : null}
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error instanceof ApiError && error.status === 409
                ? 'This time overlaps with another slot or booking. Choose another time.'
                : error instanceof Error
                ? error.message
                : 'Could not update your schedule.'}
            </Text>
          ) : null}
          <Text style={styles.sectionTitle}>Your available times</Text>
          {availability.data.slots.length ? (
            <View style={styles.slotList}>
              {availability.data.slots.map(slot => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  removing={remove.isPending}
                  onRemove={() =>
                    Alert.alert(
                      'Remove available time?',
                      'This time will no longer be offered for scheduling.',
                      [
                        {text: 'Keep it', style: 'cancel'},
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => remove.mutate(slot.id),
                        },
                      ],
                    )
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="calendar-clock-outline"
              title="No available times added"
              message="Use one of the choices above to tell clients when you can work."
            />
          )}
        </Animated.ScrollView>
        </MotionReveal>
      ) : null}
      </>
      )}
    </KeyboardAwareView>
  );
}

function SlotRow({
  slot,
  removing,
  onRemove,
}: {
  slot: Slot;
  removing: boolean;
  onRemove: () => void;
}) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  return (
    <View style={styles.slot}>
      <View style={styles.dateBox}>
        <Text style={styles.day}>
          {start.toLocaleDateString('en-IN', {day: '2-digit'})}
        </Text>
        <Text style={styles.month}>
          {start.toLocaleDateString('en-IN', {month: 'short'}).toUpperCase()}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.slotTitle}>
          {start.toLocaleDateString('en-IN', {weekday: 'long'})}
        </Text>
        <Text style={styles.muted}>
          {start.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
          })}{' '}
          –{' '}
          {end.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Pressable
        accessibilityLabel="Remove available time"
        disabled={removing}
        onPress={onRemove}
        style={styles.remove}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={21}
          color={Colors.error}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {flex: 1},
  root: {flex: 1, backgroundColor: Colors.offWhite},
  content: {padding: 20, paddingBottom: Spacing.xxl},
  todayLine: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: ProColors.border},
  todayLineTitle: {...ProType.card, color: ProColors.text},
  customToggle: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: ProColors.surface, borderWidth: 1, borderColor: ProColors.border, marginTop: 12},
  customToggleText: {...ProType.action, color: ProColors.primary, flex: 1},
  customForm: {gap: 10, backgroundColor: ProColors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: ProColors.border, marginTop: 8},
  customHelp: {...ProType.meta, color: ProColors.secondary},
  customInput: {...ProType.body, color: ProColors.text, height: 50, borderWidth: 1, borderColor: ProColors.border, borderRadius: 12, paddingHorizontal: 12},
  customTimes: {flexDirection: 'row', gap: 10},
  customTime: {flex: 1},
  customSave: {minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: ProColors.primary, borderRadius: 12},
  customSaveText: {...ProType.action, color: ProColors.surface},
  retry: {alignSelf: 'center', padding: 20},
  retryText: {...Typography.button, lineHeight: 22, color: Colors.navyMid},
  statusCard: {
    alignItems: 'stretch',
    gap: Spacing.sm,
    padding: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
  },
  statusTop: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  statusIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {flex: 1, minWidth: 0},
  cardTitle: {...Typography.h3, color: Colors.slate900},
  muted: {...Typography.caption, color: Colors.slate500, marginTop: 2},
  toggle: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: ProColors.accent,
  },
  toggleText: {...Typography.button, lineHeight: 22, color: ProColors.onAccent},
  sectionTitle: {
    ...Typography.h2,
    color: Colors.slate900,
    marginTop: Spacing.lg,
  },
  sectionHelp: {
    ...Typography.body,
    color: Colors.slate600,
    marginTop: Spacing.xs,
  },
  presetList: {gap: Spacing.sm, marginTop: Spacing.md},
  preset: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
  },
  pressed: {opacity: 0.82},
  presetIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {...Typography.body, fontWeight: '700', color: Colors.slate800},
  error: {...Typography.body, color: Colors.error, marginTop: Spacing.md},
  slotList: {gap: Spacing.sm, marginTop: Spacing.md},
  slot: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
  },
  dateBox: {width: 46, alignItems: 'center'},
  day: {...Typography.h2, color: Colors.navyDeep},
  month: {...Typography.badge, lineHeight: 16, color: Colors.navyMid},
  slotTitle: {...Typography.body, color: Colors.slate800, fontWeight: '700'},
  remove: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
