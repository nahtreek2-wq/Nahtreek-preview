import {NativeModules, PermissionsAndroid, Platform} from 'react-native';

export type DeviceLocation = {address: string; city: string; state: string; latitude: number; longitude: number};
type LocationBridge = {
  currentLocation?: () => Promise<DeviceLocation>;
  searchLocations?: (query: string) => Promise<DeviceLocation[]>;
};
const bridge = NativeModules.NahtreekRuntimeConfig as LocationBridge | undefined;

export async function currentLocation(): Promise<DeviceLocation> {
  if (Platform.OS !== 'android' || !bridge?.currentLocation) {
    throw new Error('Automatic location is unavailable. Enter your city and state manually.');
  }
  const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
    title: 'Set your work area',
    message: 'Allow approximate location so NAHTREEK can match nearby work. You can enter the area manually instead.',
    buttonPositive: 'Use location',
    buttonNegative: 'Not now',
  });
  if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Location permission was not granted. Enter your work area manually.');
  }
  const result = await bridge.currentLocation();
  if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
    throw new Error('Your location could not be read. Enter your work area manually.');
  }
  return result;
}

export async function searchLocation(query: string): Promise<DeviceLocation> {
  if (!bridge?.searchLocations) {
    throw new Error('Area search is unavailable on this device. Try using your current location.');
  }
  const results = await bridge.searchLocations(query.trim());
  if (!results.length) {
    throw new Error('We could not find that area. Check the city and state names.');
  }
  return results[0];
}
