export const DEFAULT_NOTIFICATION_PREFERENCES = {requestUpdates: true, messages: true, offers: false};
export function allowsNotification(kind: string, preferences: typeof DEFAULT_NOTIFICATION_PREFERENCES) {
  if (kind === 'offer') return preferences.offers;
  if (kind === 'message') return preferences.messages;
  if (kind === 'request' || kind === 'tracking' || kind === 'reminder') return preferences.requestUpdates;
  return true;
}
export function inTipHours(now: Date) {
  const hour = new Date(now.getTime() + 330 * 60_000).getUTCHours();
  return hour >= 9 && hour < 20;
}
