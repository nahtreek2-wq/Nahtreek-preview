import AsyncStorage from '@react-native-async-storage/async-storage';
import {createOfflineSession, getOfflineSession} from '../src/services/offlineAuth';

describe('offline authentication', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('creates a device-local profile and signs it back in with the same number', async () => {
    const created = await createOfflineSession({phoneNumber: '98765 43210', fullName: 'Arun Kumar'});
    const restored = await getOfflineSession('9876543210');

    expect(created.user).toEqual({
      id: 'offline-client-919876543210',
      fullName: 'Arun Kumar',
      phoneNumber: '+919876543210',
      roles: ['CLIENT'],
    });
    expect(restored).toEqual(created);
  });

  it('does not authenticate an unknown offline number', async () => {
    await expect(getOfflineSession('9876543210')).resolves.toBeNull();
  });

  it('restores the home city selected during account creation', async () => {
    await createOfflineSession({phoneNumber: '9000012345', fullName: 'Meena S', homeCity: 'Chennai'});

    await expect(getOfflineSession('9000012345')).resolves.toEqual(expect.objectContaining({
      user: expect.objectContaining({homeCity: 'Chennai'}),
    }));
  });
});
