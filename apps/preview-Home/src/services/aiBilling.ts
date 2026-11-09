import RazorpayCheckout from 'react-native-razorpay';
import {ApiError, api} from './apiClient';

export type AiSubscriptionView = {
  status: string;
  effective: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  feePaisa: number;
  freeUsed: number;
  freeQuota: number;
};

export function isPaywallError(cause: unknown) {
  return cause instanceof ApiError && cause.status === 402;
}

export function quotaLabel(view: AiSubscriptionView | null): string | null {
  if (!view || view.effective) return null;
  const left = Math.max(0, view.freeQuota - view.freeUsed);
  return left === 1 ? '1 free AI chat left' : `${left} free AI chats left`;
}

export function fetchAiSubscription() {
  return api.get<AiSubscriptionView>('/ai-billing/me');
}

export function cancelAiSubscription() {
  return api.post<AiSubscriptionView>('/ai-billing/cancel', {});
}

// Preview builds only: activates AI Pro without real payment. The server
// refuses this outside APP_ENV=preview, so production can never use it.
export function activateDemoAi() {
  return api.post<AiSubscriptionView>('/ai-billing/demo-activate', {});
}

// Runs the Razorpay subscription checkout, then confirms with our API so the
// row only flips ACTIVE after the provider says the mandate is real.
export async function subscribeAi(): Promise<AiSubscriptionView> {
  const started = await api.post<{keyId: string; subscriptionId: string; shortUrl: string | null}>('/ai-billing/subscribe', {});
  await RazorpayCheckout.open({
    key: started.keyId,
    subscription_id: started.subscriptionId,
    name: 'NAHTREEK AI',
    description: 'Unlimited AI chats, plans, uploads + Plus booking perks — ₹129/month',
    theme: {color: '#FACC15'},
  });
  return api.post<AiSubscriptionView>('/ai-billing/confirm', {});
}
