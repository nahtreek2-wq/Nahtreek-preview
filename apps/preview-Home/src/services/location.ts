import {Linking, NativeModules, PermissionsAndroid, Platform} from 'react-native';

export type SelectedLocation = {address: string; city: string; state: string; latitude: number; longitude: number};
type LocationBridge = {
  searchLocations: (query: string) => Promise<SelectedLocation[]>;
  currentLocation: () => Promise<SelectedLocation>;
};
const bridge = NativeModules.NahtreekRuntimeConfig as LocationBridge;

export async function openGoogleMaps(latitude: number, longitude: number): Promise<void> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('This location is not available yet.');
  }
  await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`);
}

export async function searchLocations(query: string): Promise<SelectedLocation[]> {
  if (!bridge?.searchLocations) throw new Error('Location search is unavailable on this device.');
  return bridge.searchLocations(query.trim());
}
export async function currentLocation(): Promise<SelectedLocation> {
  if (!bridge?.currentLocation) throw new Error('Please search for your location manually.');
  if (Platform.OS === 'android') {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const fine = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
    const coarse = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
    if (!fine && !coarse) {
      throw new Error('Allow approximate or precise location, or search for the address below.');
    }
  }
  return bridge.currentLocation();
}
