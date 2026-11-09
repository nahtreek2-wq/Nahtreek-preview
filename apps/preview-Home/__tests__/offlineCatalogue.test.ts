import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createOfflineRequest,
  getOfflineEngineer,
  getOfflineEngineers,
  getOfflineConversations,
  getOfflineRequests,
  getOfflineFavorites,
  getOfflineNotifications,
  getOfflineMessages,
  setOfflineFavorite,
} from '../src/data/offlineCatalogue';
import {useSessionStore} from '../src/stores/session';
function account(id: string) {
  useSessionStore
    .getState()
    .setSession({
      accessToken: 'offline.' + id,
      refreshToken: 'offline.' + id,
      user: {id, fullName: id, phoneNumber: '9000000000', roles: ['CLIENT']},
    });
}
beforeEach(async () => {
  await AsyncStorage.clear();
  account('client-a');
});
it('never presents bundled reference records as live inventory', async () => {
  await expect(getOfflineEngineers('Chennai')).resolves.toEqual([]);
  await expect(getOfflineEngineer('eng-1')).resolves.toBeUndefined();
});
it('does not create a successful request to an unlisted reference engineer', async () => {
  await expect(
    createOfflineRequest({
      engineerProfileId: 'eng-2',
      projectTitle: 'House plan',
    }),
  ).rejects.toThrow();
  await expect(getOfflineRequests()).resolves.toEqual([]);
});
it('starts local request, chat and notification history empty and removes legacy fixture rows', async () => {
  await AsyncStorage.setItem(
    '@nahtreek/offline-catalogue/v1/accounts/client-a/requests',
    JSON.stringify([{id: 'req-1'}, {id: 'user-request-1'}]),
  );
  await AsyncStorage.setItem(
    '@nahtreek/offline-catalogue/v1/accounts/client-a/conversations',
    JSON.stringify([{id: 'conv-1'}, {id: 'user-conversation-1'}]),
  );
  await AsyncStorage.setItem(
    '@nahtreek/offline-catalogue/v1/accounts/client-a/notifications',
    JSON.stringify([{id: 'n-1'}, {id: 'user-notification-1'}]),
  );
  await AsyncStorage.setItem(
    '@nahtreek/offline-catalogue/v1/accounts/client-a/messages/conv-1',
    JSON.stringify([{id: 'm-1'}, {id: 'user-message-1'}]),
  );

  await expect(getOfflineRequests()).resolves.toEqual([{id: 'user-request-1'}]);
  await expect(getOfflineConversations()).resolves.toEqual([{id: 'user-conversation-1'}]);
  await expect(getOfflineNotifications()).resolves.toEqual([{id: 'user-notification-1'}]);
  await expect(getOfflineMessages('conv-1')).resolves.toEqual([{id: 'user-message-1'}]);
  expect(await AsyncStorage.getItem(
    '@nahtreek/offline-catalogue/v1/accounts/client-a/requests',
  )).toBe(JSON.stringify([{id: 'user-request-1'}]));
});
it('isolates saved items and starts each real account with empty history', async () => {
  await setOfflineFavorite('real-professional-id', true);
  account('client-b');
  await expect(getOfflineFavorites()).resolves.toEqual([]);
  await expect(getOfflineRequests()).resolves.toEqual([]);
  await expect(getOfflineNotifications()).resolves.toEqual([]);
  account('client-a');
  await expect(getOfflineFavorites()).resolves.toEqual([
    expect.objectContaining({professionalId: 'real-professional-id'}),
  ]);
});
it('rejects a pending private write when the account changes', async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(async () => {
    account('client-b');
    return null;
  });
  await expect(setOfflineFavorite('provider-a', true)).rejects.toThrow(
    'account changed',
  );
  await expect(getOfflineFavorites()).resolves.toEqual([]);
});
