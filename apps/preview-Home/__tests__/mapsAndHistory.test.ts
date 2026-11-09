import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking} from 'react-native';
import {openGoogleMaps} from '../src/services/location';
import {getOfflineActivity, updateOfflineClientProfile} from '../src/data/offlineCatalogue';
import {useSessionStore} from '../src/stores/session';
beforeEach(async () => { await AsyncStorage.clear(); });
it('opens a properly encoded Google Maps location link', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await openGoogleMaps(13.08, 80.27);
  expect(open).toHaveBeenCalledWith('https://www.google.com/maps/search/?api=1&query=13.08%2C80.27');
  open.mockRestore();
});
it.each([[NaN, 0], [91, 0], [0, -181], [Infinity, 0]])('rejects an invalid Maps location (%s, %s)', async (lat, lng) => {
  await expect(openGoogleMaps(lat, lng)).rejects.toThrow('not available');
});
it('keeps profile history account-scoped and uses the selected city state', async () => {
  const user = {id: 'client-chennai', fullName: 'Meena', phoneNumber: '9000012345', roles: ['CLIENT'], homeCity: 'Chennai'};
  useSessionStore.getState().setSession({accessToken: 'offline.a', refreshToken: 'offline.a', user});
  const profile = await updateOfflineClientProfile(user, {fullName: 'Meena S', avatarUrl: 'file:///private/photo.jpg'});
  expect(profile).toMatchObject({city: 'Chennai', state: 'Tamil Nadu', avatarUrl: 'file:///private/photo.jpg'});
  await expect(getOfflineActivity()).resolves.toEqual([expect.objectContaining({action: 'PROFILE_UPDATED'})]);
  useSessionStore.getState().setSession({accessToken: 'offline.b', refreshToken: 'offline.b', user: {...user, id: 'client-b'}});
  await expect(getOfflineActivity()).resolves.toEqual([]);
});
