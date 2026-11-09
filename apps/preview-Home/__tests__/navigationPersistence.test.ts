import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPersistedNavigationState,
  isNavigationState,
  loadPersistedNavigationState,
  sanitizeRestoredState,
} from '../src/navigation/navigationPersistence';

const mainTabsState = {
  index: 1,
  routes: [{key: 'tabs', name: 'MainTabs'}, {key: 'chat', name: 'Chat', params: {conversationId: 'c1'}}],
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

it('accepts well-formed navigation states and rejects junk', () => {
  expect(isNavigationState(mainTabsState)).toBe(true);
  expect(isNavigationState(null)).toBe(false);
  expect(isNavigationState({})).toBe(false);
  expect(isNavigationState({routes: [], index: 0})).toBe(false);
  expect(isNavigationState({routes: [{name: 'MainTabs'}]})).toBe(false);
});

it('restores stacks rooted at MainTabs but never a bare auth screen', () => {
  expect(sanitizeRestoredState(mainTabsState)).toEqual(mainTabsState);
  expect(
    sanitizeRestoredState({index: 0, routes: [{key: 'login', name: 'Login'}]}),
  ).toBeUndefined();
  expect(sanitizeRestoredState({index: 0, routes: []})).toBeUndefined();
});

it('round-trips state for the same account only', async () => {
  await AsyncStorage.setItem(
    'nahtreek-home-nav-state-v1',
    JSON.stringify({account: 'user-1', state: mainTabsState}),
  );
  expect(await loadPersistedNavigationState('user-1')).toEqual(mainTabsState);
  // A different account (or guest) never resumes another user's screens.
  expect(await loadPersistedNavigationState('user-2')).toBeUndefined();
  expect(await loadPersistedNavigationState('guest')).toBeUndefined();
});

it('ignores corrupt storage and survives storage failures', async () => {
  await AsyncStorage.setItem('nahtreek-home-nav-state-v1', 'not-json{');
  expect(await loadPersistedNavigationState('user-1')).toBeUndefined();
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('locked'));
  expect(await loadPersistedNavigationState('user-1')).toBeUndefined();
  jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('locked'));
  await expect(clearPersistedNavigationState()).resolves.toBeUndefined();
});

it('clears stored navigation on sign-out', async () => {
  await AsyncStorage.setItem(
    'nahtreek-home-nav-state-v1',
    JSON.stringify({account: 'user-1', state: mainTabsState}),
  );
  await clearPersistedNavigationState();
  expect(await loadPersistedNavigationState('user-1')).toBeUndefined();
});
