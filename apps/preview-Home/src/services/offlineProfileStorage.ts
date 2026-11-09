import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';
import {runtimeConfig} from '../config/runtime';
import {isApiConfigured} from './config';

type ProfileBridge = {
  getLocalProfile(userId: string): Promise<string | null>;
  setLocalProfile(userId: string, payload: string): Promise<void>;
};
const legacyKey = (userId: string) =>
  `@nahtreek/offline-catalogue/v1/profile/${userId}`;
function bridge(): ProfileBridge | undefined {
  const native = NativeModules.NahtreekRuntimeConfig as
    | Partial<ProfileBridge>
    | undefined;
  return !isApiConfigured &&
    runtimeConfig.environment === 'staging' &&
    native?.getLocalProfile &&
    native?.setLocalProfile
    ? (native as ProfileBridge)
    : undefined;
}
export async function readOfflineProfile(
  userId: string,
): Promise<string | null> {
  const native = bridge();
  if (!native) return AsyncStorage.getItem(legacyKey(userId));
  const encrypted = await native.getLocalProfile(userId);
  if (encrypted) return encrypted;
  const legacy = await AsyncStorage.getItem(legacyKey(userId));
  if (!legacy) return null;
  const parsed: unknown = JSON.parse(legacy);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as {userId?: unknown}).userId !== userId
  )
    return null;
  await native.setLocalProfile(userId, legacy);
  await AsyncStorage.removeItem(legacyKey(userId));
  return legacy;
}
export async function writeOfflineProfile(
  userId: string,
  payload: string,
): Promise<void> {
  const native = bridge();
  if (!native) return AsyncStorage.setItem(legacyKey(userId), payload);
  await native.setLocalProfile(userId, payload);
  await AsyncStorage.removeItem(legacyKey(userId));
}
