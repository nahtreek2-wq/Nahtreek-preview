import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Colors} from '../design-system/src';
import {CheckoutCancelledError, GatewayUnavailableError, openCheckout} from './razorpayGateway';
import type {CheckoutInput, CheckoutResult} from './razorpayGateway';

export type PaymentStatusView = {status: string; amountPaisa: number; currency: string; paidAt?: string | null; releasedAt?: string | null; refundedAt?: string | null};
export type CreatedOrder = {paymentId: string; keyId: string; razorpayOrderId: string; amountPaisa: number; currency: string; plusDiscountPaisa?: number};
export type VerifiedCheckout = {razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string};
export type PaymentHooks = {
  createOrder: () => Promise<CreatedOrder>;
  verify: (result: VerifiedCheckout) => Promise<PaymentStatusView>;
  loadStatus: () => Promise<PaymentStatusView | null>;
  checkout?: (input: CheckoutInput) => Promise<CheckoutResult>;
  dispute?: (reason: string) => Promise<PaymentStatusView>;
};

type Props = {requestId: string; requestKind?: 'service' | 'engineer'; quoteAmount: number; hooks: PaymentHooks;
  receiptEmail?: string | null; onSaveReceiptEmail?: (email: string) => Promise<unknown>; isPlus?: boolean};

const PENDING = ['ORDER_CREATED', 'REFUND_PENDING', 'RELEASE_PENDING'];
const rupees = (paisa: number) => `₹${(paisa / 100).toLocaleString('en-IN')}`;

function messageFor(error: unknown): string {
  if (error instanceof GatewayUnavailableError) return error.message;
  const status = (error as {status?: number})?.status;
  if (status === 503) return 'Online payments are not available yet. Work can proceed; you will be asked to pay once payments open.';
  if (status === 409) return 'This payment was already processed. Refreshing the status.';
  if (status === 401) return 'Your sign-in has expired. Please sign in again.';
  if (error instanceof Error && error.message) return error.message;
  return 'The payment could not be completed. Check the booking status before retrying.';
}

export function PaymentSection({requestId, requestKind = 'service', quoteAmount, hooks, receiptEmail, onSaveReceiptEmail, isPlus}: Props) {
  const cache = useQueryClient();
  const [failed, setFailed] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const engineer = requestKind === 'engineer';
  // Receipt capture: offered only while unpaid and only when the account has
  // no email yet. A bad address blocks the tap (fixable inline); a failed
  // save never blocks the payment — the receipt is skipped instead.
  const captureEmail = Boolean(onSaveReceiptEmail && !receiptEmail);
  const status = useQuery({queryKey: ['payment', requestKind, requestId], queryFn: hooks.loadStatus, retry: 1,
    refetchInterval: query => (query.state.data && PENDING.includes(query.state.data.status) ? 5000 : false)});
  const pay = useMutation({mutationFn: async () => {
    const order = await hooks.createOrder();
    const result = await (hooks.checkout ?? openCheckout)({keyId: order.keyId, orderId: order.razorpayOrderId,
      amountPaisa: order.amountPaisa, currency: order.currency, name: 'NAHTREEK',
      description: engineer ? 'Consultation fee payment' : 'Service booking payment'});
    if (!result.razorpayOrderId || !result.razorpayPaymentId || !result.razorpaySignature)
      throw new Error('The payment response was incomplete. Check the booking status before retrying.');
    return hooks.verify({razorpayOrderId: result.razorpayOrderId, razorpayPaymentId: result.razorpayPaymentId, razorpaySignature: result.razorpaySignature});
  }, onSuccess: () => {
    setFailed(null);
    setCancelled(false);
    void cache.invalidateQueries({queryKey: ['payment', requestKind, requestId]});
    if (engineer) {
      void cache.invalidateQueries({queryKey: ['request-detail', requestId]});
      void cache.invalidateQueries({queryKey: ['requests']});
    } else {
      void cache.invalidateQueries({queryKey: ['service-journey', requestId]});
    }
  }, onError: error => {
    if (error instanceof CheckoutCancelledError) {
      setCancelled(true);
      setFailed(null);
      void status.refetch();
      return;
    }
    setCancelled(false);
    setFailed(messageFor(error));
    if ((error as {status?: number})?.status === 409) void status.refetch();
  }});

  const busy = pay.isPending || status.isFetching;
  const startPay = async () => {
    if (captureEmail && emailDraft.trim()) {
      const value = emailDraft.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFailed('Enter a valid email for the receipt, or leave it blank to skip.');
        return;
      }
      try {
        await onSaveReceiptEmail!(value);
        setEmailWarning(null);
        void cache.invalidateQueries({queryKey: ['client-profile']});
      } catch {
        setEmailWarning('Receipt email could not be saved — add it in Profile to get payment receipts.');
      }
    }
    setFailed(null);
    pay.mutate();
  };
  const payAgain = (label: string, note: string) => <>
    <Text style={s.text}>{note}</Text>
    {captureEmail ? <View style={s.disputeBox}>
      <Text style={s.text}>Receipt email — your payment receipt will be sent here.</Text>
      <TextInput accessibilityLabel="Receipt email" style={s.emailInput} keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} placeholder="you@example.com"
        value={emailDraft} onChangeText={text => { setEmailDraft(text); setEmailWarning(null); }}
        editable={!pay.isPending} />
    </View> : null}
    {emailWarning ? <Text style={s.text}>{emailWarning}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled: busy, busy: pay.isPending}}
      disabled={busy} onPress={() => { void startPay(); }} style={[s.button, busy && {opacity: 0.5}]}>
      <Text style={s.buttonText}>{pay.isPending ? 'Opening secure payment…' : label}</Text>
    </Pressable>
  </>;
  const dispute = useMutation({mutationFn: (reason: string) => hooks.dispute!(reason),
    onSuccess: () => {
      setFailed(null);
      setDisputeOpen(false);
      setDisputeReason('');
      void cache.invalidateQueries({queryKey: ['payment', requestKind, requestId]});
    },
    onError: error => setFailed(messageFor(error))});
  const reportProblem = () => {
    if (!hooks.dispute) return null;
    if (!disputeOpen) {
      return <Pressable accessibilityRole="button" accessibilityLabel="Report a problem with this payment"
        onPress={() => { setFailed(null); setDisputeOpen(true); }}>
        <Text style={s.retryText}>Report a problem</Text>
      </Pressable>;
    }
    return <View style={s.disputeBox}>
      <Text style={s.text}>Describe the problem. The money stays frozen while support reviews it.</Text>
      <TextInput accessibilityLabel="Problem description" style={s.disputeInput} multiline numberOfLines={3}
        placeholder="What went wrong? (minimum 10 characters)" value={disputeReason} onChangeText={setDisputeReason}
        editable={!dispute.isPending} />
      <Pressable accessibilityRole="button" accessibilityLabel="Submit problem report"
        accessibilityState={{disabled: dispute.isPending || disputeReason.trim().length < 10}}
        disabled={dispute.isPending || disputeReason.trim().length < 10}
        onPress={() => dispute.mutate(disputeReason.trim())} style={[s.button, (dispute.isPending || disputeReason.trim().length < 10) && {opacity: 0.5}]}>
        <Text style={s.buttonText}>{dispute.isPending ? 'Submitting…' : 'Submit report'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancel problem report"
        disabled={dispute.isPending} onPress={() => { setDisputeOpen(false); setDisputeReason(''); }}>
        <Text style={s.retryText}>Cancel</Text>
      </Pressable>
    </View>;
  };

  let body: React.ReactNode;
  if (status.isPending) {
    body = <View style={s.row}><ActivityIndicator /><Text style={s.text}>Checking payment…</Text></View>;
  } else if (status.isError) {
    body = <>
      <Text style={s.error}>Could not load the payment status.</Text>
      <Pressable accessibilityRole="button" disabled={status.isFetching} onPress={() => void status.refetch()}>
        <Text style={s.retryText}>{status.isFetching ? 'Checking…' : 'Try again'}</Text>
      </Pressable>
    </>;
  } else {
    const view = status.data;
    if (!view || view.status === 'FAILED' || view.status === 'NOT_STARTED') {
      body = engineer
        ? payAgain(`Pay ${rupees(Math.round(quoteAmount * 100))} consultation fee`,
            `Pay ${rupees(Math.round(quoteAmount * 100))} for the consultation. The money is held safely and reaches the engineer after review.${isPlus ? ' Your Plus 2% discount (up to ₹100) applies automatically at checkout.' : ''}`)
        : payAgain(`Pay ${rupees(Math.round(quoteAmount * 100))} securely`,
            `Pay ${rupees(Math.round(quoteAmount * 100))} for the approved scope. The money is held safely and reaches the professional only after you confirm the work.`);
    } else if (view.status === 'ORDER_CREATED') {
      body = payAgain(`Continue payment of ${rupees(view.amountPaisa)}`,
        `A payment of ${rupees(view.amountPaisa)} was started but not finished. Continue to complete it.`);
    } else if (view.status === 'PAID' || view.status === 'HELD') {
      body = <View style={s.ok}><Text style={s.okTitle}>Paid {rupees(view.amountPaisa)}</Text>
        <Text style={s.text}>{engineer
          ? 'The amount is held safely. It releases to the engineer after review.'
          : 'The amount is held safely. It releases to the professional when you confirm the completed work.'}</Text>
        {reportProblem()}</View>;
    } else if (view.status === 'RELEASE_PENDING') {
      body = <View style={s.row}><ActivityIndicator /><Text style={s.text}>{engineer
        ? `Releasing ${rupees(view.amountPaisa)} to the engineer…`
        : `Work confirmed. Releasing ${rupees(view.amountPaisa)} to the professional…`}</Text></View>;
    } else if (view.status === 'RELEASED') {
      body = <View style={s.ok}><Text style={s.okTitle}>Released {rupees(view.amountPaisa)}</Text>
        <Text style={s.text}>{engineer
          ? 'The engineer received the consultation fee. Thank you.'
          : 'The professional received the payment after your confirmation. Thank you.'}</Text></View>;
    } else if (view.status === 'REFUND_PENDING') {
      body = <View style={s.row}><ActivityIndicator /><Text style={s.text}>A full refund of {rupees(view.amountPaisa)} is on the way to your account.</Text></View>;
    } else if (view.status === 'REFUNDED') {
      body = <Text style={s.text}>Refunded {rupees(view.amountPaisa)} in full. It should reflect in your account shortly.</Text>;
    } else if (view.status === 'DISPUTED') {
      body = <View style={s.ok}><Text style={s.okTitle}>Under review</Text>
        <Text style={s.text}>Support is looking into the reported problem. The {rupees(view.amountPaisa)} stays frozen until they decide.</Text></View>;
    } else if (view.status === 'COLLECTED_UNSETTLED' || view.status === 'SETTLED') {
      body = <View style={s.ok}><Text style={s.okTitle}>Paid directly {rupees(view.amountPaisa)}</Text>
        <Text style={s.text}>This booking was settled directly with the professional. No online payment is needed.</Text></View>;
    } else {
      body = <Text style={s.text}>This payment needs support review. No further action is needed from you right now.</Text>;
    }
  }

  return <View style={s.card}>
    <Text style={s.heading}>Payment</Text>
    {body}
    {cancelled ? <Text style={s.text}>Payment cancelled. No money moved — you can pay whenever you are ready.</Text> : null}
    {failed ? <View accessibilityRole="alert" style={s.actionError}><Text style={s.error}>{failed}</Text></View> : null}
  </View>;
}

const s = StyleSheet.create({
  card: {padding: 16, gap: 12, backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.slate200},
  heading: {fontSize: 18, fontWeight: '700', color: Colors.navyDeep},
  text: {fontSize: 15, lineHeight: 22, color: Colors.slate800},
  error: {color: Colors.error, lineHeight: 21},
  actionError: {padding: 12, gap: 8, borderRadius: 12, backgroundColor: Colors.errorBg},
  retryText: {fontSize: 14, fontWeight: '700', color: Colors.navyMid, paddingVertical: 8},
  button: {backgroundColor: Colors.amber, borderRadius: 12, minHeight: 50, padding: 14, justifyContent: 'center'},
  buttonText: {color: Colors.navyDeep, fontWeight: '700', textAlign: 'center'},
  ok: {backgroundColor: Colors.successBg, padding: 12, borderRadius: 12, gap: 8},
  okTitle: {fontSize: 16, fontWeight: '700', color: Colors.success},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  disputeBox: {gap: 10, marginTop: 4},
  disputeInput: {minHeight: 80, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate200,
    backgroundColor: Colors.white, padding: 12, fontSize: 15, lineHeight: 22, color: Colors.slate800, textAlignVertical: 'top'},
  emailInput: {minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate200,
    backgroundColor: Colors.white, paddingHorizontal: 12, fontSize: 15, color: Colors.slate800},
});
