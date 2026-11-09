jest.mock('../src/config/runtime', () => ({
  runtimeConfig: {environment: 'staging'},
}));
jest.mock('../src/services/config', () => ({isApiConfigured: false}));
import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  readOfflineProfile,
  writeOfflineProfile,
} from '../src/services/offlineProfileStorage';
const key = '@nahtreek/offline-catalogue/v1/profile/client-a';
const profile = JSON.stringify({userId: 'client-a', email: 'qa@example.com'});
beforeEach(async () => {
  await AsyncStorage.clear();
  NativeModules.NahtreekRuntimeConfig = {
    getLocalProfile: jest.fn(async () => null),
    setLocalProfile: jest.fn(async () => undefined),
  };
});
it('uses encrypted native storage without writing a plaintext profile copy', async () => {
  await writeOfflineProfile('client-a', profile);
  expect(
    NativeModules.NahtreekRuntimeConfig.setLocalProfile,
  ).toHaveBeenCalledWith('client-a', profile);
  expect(await AsyncStorage.getItem(key)).toBeNull();
  NativeModules.NahtreekRuntimeConfig.getLocalProfile.mockResolvedValue(
    profile,
  );
  await expect(readOfflineProfile('client-a')).resolves.toBe(profile);
});
it('migrates only matching legacy profiles and removes the duplicate after encryption', async () => {
  await AsyncStorage.setItem(key, JSON.stringify({userId: 'client-b'}));
  await expect(readOfflineProfile('client-a')).resolves.toBeNull();
  expect(
    NativeModules.NahtreekRuntimeConfig.setLocalProfile,
  ).not.toHaveBeenCalled();
  await AsyncStorage.setItem(key, profile);
  await expect(readOfflineProfile('client-a')).resolves.toBe(profile);
  expect(await AsyncStorage.getItem(key)).toBeNull();
});
it('preserves recoverable legacy data when encryption fails', async () => {
  await AsyncStorage.setItem(key, profile);
  NativeModules.NahtreekRuntimeConfig.setLocalProfile.mockRejectedValue(
    new Error('storage unavailable'),
  );
  await expect(readOfflineProfile('client-a')).rejects.toThrow(
    'storage unavailable',
  );
  expect(await AsyncStorage.getItem(key)).toBe(profile);
});
