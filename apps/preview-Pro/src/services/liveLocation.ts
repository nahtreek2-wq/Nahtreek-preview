import {NativeModules, PermissionsAndroid, Platform} from 'react-native';
import {api} from './apiClient';
import {runtimeConfig} from '../config/runtime';
const bridge = NativeModules.NahtreekRuntimeConfig;

export async function allowLiveLocation() {
  if (Platform.OS === 'ios') return; // iOS prompts from the native location request.
  if (Platform.OS !== 'android') {
    throw new Error('Live work location is currently available on Android and iOS.');
  }
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  if (
    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !==
    PermissionsAndroid.RESULTS.GRANTED
  ) {
    throw new Error(
      'Allow precise location to offer nearby visits. You can still manage existing work without sharing.',
    );
  }
}

export async function publishCurrentLocation(online = true) {
  await allowLiveLocation();
  const location = await bridge.currentLocation();
  if (location.isMock && runtimeConfig.environment === 'production') {
    throw new Error(
      'Mock location cannot be used for nearby jobs. Turn off mock location and try again.',
    );
  }
  return api.post('/service-workflow/presence', {
    online,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    observedAt: location.observedAt,
  });
}

export async function startJourneyLocationSharing(token?: string | null) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('Live journey sharing is currently available on Android and iOS.');
  }
  if (!token) {
    throw new Error('Your session expired. Sign in again before starting the journey.');
  }
  await allowLiveLocation();
  await publishCurrentLocation(true);
  const status = (await bridge.liveLocationStatus()) as {running: boolean};
  if (!status.running) {
    await bridge.startLiveLocation(token);
  }
}

export async function stopJourneyLocationSharing() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return;
  }
  const status = (await bridge.liveLocationStatus()) as {running: boolean};
  if (status.running) {
    await bridge.stopLiveLocation();
  } else {
    await publishCurrentLocation(false);
  }
}
