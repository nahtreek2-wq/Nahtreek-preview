import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ScreenHeader} from '../components/ScreenHeader';
import {ScreenLoading} from '../components/ScreenLoading';
import {EmptyState} from '../components/EmptyState';
import {api} from '../services/apiClient';
import {useProToast} from '../stores/proToast';
import {ProColors, ProRadius, ProSpacing, ProType} from '../theme/professionalTheme';
import {CheckoutCancelledError, GatewayUnavailableError, openCheckout} from '../../../../packages/mobile-booking/razorpayGateway';
import type {CheckoutInput, CheckoutResult} from '../../../../packages/mobile-booking/razorpayGateway';

export type MembershipView = {status: string; effective: boolean; currentPeriodStart: string | null;
  currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; feePaisa: number; currency: string;
  lifetimeSavingsPaisa?: number; jobsAtMemberRate?: number};
export type MembershipHooks = {
  load: () => Promise<MembershipView>;
  subscribe: () => Promise<MembershipView & {keyId: string; subscriptionId: string | null; shortUrl: string | null}>;
  confirm: () => Promise<MembershipView>;
  cancel: () => Promise<MembershipView>;
  checkout?: (input: CheckoutInput) => Promise<CheckoutResult>;
};

const defaultHooks: MembershipHooks = {
  load: () => api.get<MembershipView>('/memberships/me'),
  subscribe: () => api.post<MembershipView & {keyId: string; subscriptionId: string | null; shortUrl: string | null}>('/memberships/subscribe'),
  confirm: () => api.post<MembershipView>('/memberships/confirm'),
  cancel: () => api.post<MembershipView>('/memberships/cancel', {}),
};

const BENEFITS = [
  {title: 'First job every month at 0% commission', body: 'Your first booking each calendar month keeps the full amount.'},
  {title: '7% commission, not 10%', body: 'Keep more of every other job while your membership is active.'},
  {title: '₹2,000 dues room, not ₹500', body: 'New jobs pause only after ₹2,000 unsettled instead of ₹500.'},
  {title: 'Top of discovery', body: 'Members rank above non-members in client search results.'},
  {title: 'Pro member badge', body: 'A verified badge on your profile and discovery cards.'},
];

function messageFor(error: unknown): string {
  if (error instanceof GatewayUnavailableError) return error.message;
  const status = (error as {status?: number})?.status;
  if (status === 503) return 'Membership billing is not available yet. Please check back soon.';
  if (status === 401) return 'Your sign-in has expired. Please sign in again.';
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export function MembershipScreen({hooks = defaultHooks}: {hooks?: MembershipHooks}) {
  const navigation = useNavigation();
  const cache = useQueryClient();
  const toast = useProToast();
  const [failed, setFailed] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const query = useQuery({queryKey: ['membership'], queryFn: hooks.load, retry: 1});
  const refresh = () => void cache.invalidateQueries({queryKey: ['membership']});

  const subscribe = useMutation({mutationFn: async () => {
    const order = await hooks.subscribe();
    if (!order.subscriptionId) return hooks.confirm();
    await (hooks.checkout ?? openCheckout)({keyId: order.keyId, subscriptionId: order.subscriptionId,
      currency: order.currency, name: 'NAHTREEK Pro', description: 'Pro membership (monthly)'});
    return hooks.confirm();
  }, onSuccess: () => { setFailed(null); setCancelled(false); refresh(); toast('Pro membership is active.', 'success'); },
  onError: error => {
    if (error instanceof CheckoutCancelledError) { setCancelled(true); setFailed(null); refresh(); return; }
    setCancelled(false);
    setFailed(messageFor(error));
  }});

  const cancel = useMutation({mutationFn: () => hooks.cancel(),
    onSuccess: () => { setFailed(null); refresh(); toast('Membership cancelled. Benefits stay until the period ends.', 'success'); }, onError: error => setFailed(messageFor(error))});

  const startCancel = () => Alert.alert('Cancel membership?',
    'Your benefits continue until the paid period ends. You can resubscribe anytime.',
    [{text: 'Keep membership', style: 'cancel'}, {text: 'Cancel membership', style: 'destructive', onPress: () => cancel.mutate()}]);

  const busy = subscribe.isPending || cancel.isPending;
  const view = query.data;
  const endDate = view?.currentPeriodEnd ? new Date(view.currentPeriodEnd).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : null;

  return <View style={styles.root}>
    <ScreenHeader title="Pro membership" subtitle="Lower fees and higher visibility" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.body}>
      {query.isPending ? <ScreenLoading label="Loading your membership…" /> : null}
      {query.isError ? <>
        <EmptyState icon="cloud-off-outline" title="Membership could not load" message="Check your connection and try again." />
        <Pressable accessibilityRole="button" disabled={query.isFetching} onPress={() => void query.refetch()} style={styles.retry}>
          <Text style={styles.retryText}>{query.isFetching ? 'Checking…' : 'Try again'}</Text>
        </Pressable>
      </> : null}
      {view && !view.effective ? <View style={styles.card}>
        <Text style={styles.price}>₹399<Text style={styles.perMonth}>/month</Text></Text>
        {view.status === 'PAST_DUE' ? <Text style={styles.warning}>Your last membership payment failed. Subscribe again to restore benefits with a fresh month.</Text> : null}
        {BENEFITS.map(benefit => <View key={benefit.title} style={styles.benefit}>
          <Text style={styles.benefitTitle}>{benefit.title}</Text>
          <Text style={styles.text}>{benefit.body}</Text>
        </View>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Subscribe to Pro membership" accessibilityState={{disabled: busy, busy: subscribe.isPending}}
          disabled={busy} onPress={() => subscribe.mutate()} style={[styles.button, busy && {opacity: 0.5}]}>
          <Text style={styles.buttonText}>{subscribe.isPending ? 'Opening secure checkout…' : view.status === 'PENDING' ? 'Complete authorization' : 'Subscribe for ₹399/month'}</Text>
        </Pressable>
        <Text style={styles.small}>Recurring UPI autopay via Razorpay. Cancel anytime; benefits run until the paid month ends.</Text>
      </View> : null}
      {view?.effective ? <View style={styles.card}>
        <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>PRO MEMBER</Text></View>
        <Text style={styles.heading}>Your Pro benefits are active</Text>
        <Text style={styles.text}>First job each month free, 7% commission after that, ₹2,000 dues room, top discovery placement and the member badge{endDate ? ` through ${endDate}` : ''}.</Text>
        {(view.lifetimeSavingsPaisa ?? 0) > 0 ? <View style={styles.savings}>
          <Text style={styles.savingsTitle}>You have saved ₹{((view.lifetimeSavingsPaisa ?? 0) / 100).toLocaleString('en-IN')} so far</Text>
          <Text style={styles.savingsBody}>{view.jobsAtMemberRate ?? 0} {(view.jobsAtMemberRate ?? 0) === 1 ? 'job' : 'jobs'} billed below the 10% standard rate.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="View commission dues" onPress={() => (navigation as {navigate: (route: string) => void}).navigate('Dues')} style={styles.savingsLink}>
            <Text style={styles.savingsLinkText}>View commission dues</Text>
          </Pressable>
        </View> : null}
        {view.cancelAtPeriodEnd ? <Text style={styles.text}>You cancelled renewal. Benefits end {endDate ?? 'at the period end'}; resubscribe anytime after.</Text>
        : <Pressable accessibilityRole="button" accessibilityLabel="Cancel membership" disabled={busy}
          onPress={startCancel} style={[styles.secondaryButton, busy && {opacity: 0.5}]}>
          <Text style={styles.secondaryButtonText}>{cancel.isPending ? 'Cancelling…' : 'Cancel membership'}</Text>
        </Pressable>}
      </View> : null}
      {cancelled ? <Text style={styles.text}>Checkout cancelled. Nothing was charged — subscribe whenever you are ready.</Text> : null}
      {failed ? <View accessibilityRole="alert" style={styles.actionError}><Text style={styles.error}>{failed}</Text></View> : null}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: ProColors.background},
  body: {padding: ProSpacing.lg, gap: ProSpacing.md},
  card: {backgroundColor: ProColors.surface, borderRadius: ProRadius.card, padding: ProSpacing.lg, gap: ProSpacing.md},
  price: {fontSize: 34, fontWeight: '800', color: ProColors.text},
  perMonth: {fontSize: 16, fontWeight: '600', color: ProColors.muted},
  benefit: {gap: 2},
  benefitTitle: {fontSize: 16, fontWeight: '700', color: ProColors.text},
  text: {fontSize: 15, lineHeight: 22, color: ProColors.text},
  small: {fontSize: 13, lineHeight: 19, color: ProColors.muted},
  warning: {fontSize: 14, lineHeight: 20, color: ProColors.warning, backgroundColor: ProColors.warningSoft, padding: 10, borderRadius: 10},
  heading: {...ProType.card, color: ProColors.text},
  button: {backgroundColor: ProColors.primary, borderRadius: ProRadius.input, minHeight: 52, padding: 14, justifyContent: 'center'},
  buttonText: {color: '#FFFFFF', fontWeight: '700', textAlign: 'center', fontSize: 16},
  secondaryButton: {borderRadius: ProRadius.input, minHeight: 50, padding: 12, justifyContent: 'center', borderWidth: 1, borderColor: ProColors.muted},
  secondaryButtonText: {color: ProColors.text, fontWeight: '700', textAlign: 'center'},
  retry: {alignItems: 'center', paddingVertical: 8},
  retryText: {fontSize: 14, fontWeight: '700', color: ProColors.primary},
  actionError: {padding: 12, borderRadius: 12, backgroundColor: ProColors.errorSoft},
  error: {color: ProColors.error, lineHeight: 21},
  activeBadge: {alignSelf: 'flex-start', backgroundColor: ProColors.primary, borderRadius: ProRadius.pill, paddingHorizontal: 12, paddingVertical: 6},
  activeBadgeText: {color: '#FFFFFF', fontWeight: '800', fontSize: 12, letterSpacing: 1},
  savings: {backgroundColor: ProColors.successSoft, borderRadius: ProRadius.input, padding: ProSpacing.md, gap: 2},
  savingsTitle: {fontSize: 15, fontWeight: '800', color: ProColors.success},
  savingsBody: {fontSize: 15, lineHeight: 22, color: ProColors.success},
  savingsLink: {marginTop: 4, alignSelf: 'flex-start'},
  savingsLinkText: {fontSize: 15, fontWeight: '800', color: ProColors.success, textDecorationLine: 'underline'},
});
