import {useEffect} from 'react';
import {AppState, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from 'react-native';

type Options = {
  userId?: string;
  accessToken: string | null;
  baseUrl?: string;
  app: 'client' | 'professional';
  registerDevice: (token: string, app: 'client' | 'professional') => Promise<unknown>;
  onUpdate: () => void;
};
let permissionAsked = false;

export function usePushNotifications({userId, accessToken, baseUrl, app, onUpdate, registerDevice}: Options) {
  const native = NativeModules.NahtreekPush;
  useEffect(() => {
    if (!userId) native?.disable();
    return () => {native?.disable();};
  }, [native, userId]);
  useEffect(() => {
    if (Platform.OS !== 'android' || !native?.configured || !userId || !accessToken || !baseUrl) return;
    let cancelled = false;
    let busy = false;
    let registeredToken: string | undefined;
    const register = async () => {
      if (cancelled || busy || AppState.currentState !== 'active') return;
      busy = true;
      try {
        if (Number(Platform.Version) >= 33) {
          const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
          if (!(await PermissionsAndroid.check(permission))) {
            if (permissionAsked) return;
            permissionAsked = true;
            if (await PermissionsAndroid.request(permission, {
            title: 'Get work and account updates', message: 'Allow NAHTREEK to notify you about requests, messages and verification.', buttonPositive: 'Continue', buttonNegative: 'Not now',
            }) !== PermissionsAndroid.RESULTS.GRANTED) return;
          }
        }
        if (cancelled) return;
        const token = await native.getToken() as string | null;
        if (cancelled || !token || token === registeredToken) return;
        // Use the app's authenticated client so an expired access token can be
        // refreshed and the device rebound to the new session.
        await registerDevice(token, app);
        if (!cancelled) registeredToken = token;
      } catch { /* Retry while open and on the next app resume; in-app inbox stays available. */ }
      finally {busy = false;}
    };
    const events = new NativeEventEmitter(native);
    const changed = events.addListener('NahtreekPushTokenChanged', () => {registeredToken = undefined; void register();});
    const received = events.addListener('NahtreekPushReceived', onUpdate);
    const state = AppState.addEventListener('change', value => {if (value === 'active') {void register(); onUpdate();}});
    const retry = setInterval(() => {void register();}, 60_000);
    void register();
    return () => {cancelled = true; clearInterval(retry); changed.remove(); received.remove(); state.remove();};
  }, [native, userId, accessToken, baseUrl, app, onUpdate, registerDevice]);
}
