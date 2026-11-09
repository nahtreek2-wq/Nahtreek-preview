import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPersistedNavigationState,
  isNavigationState,
  loadPersistedNavigationState,
  sanitizeRestoredState,
} from '../src/navigation/navigationPersistence';

const mainState = {
  index: 1,
  routes: [{key: 'main', name: 'Main'}, {key: 'chat', name: 'Chat', params: {conversationId: 'c1'}}],
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

it('accepts well-formed navigation states and rejects junk', () => {
  expect(isNavigationState(mainState)).toBe(true);
  expect(isNavigationState(null)).toBe(false);
  expect(isNavigationState({})).toBe(false);
  expect(isNavigationState({routes: [], index: 0})).toBe(false);
  expect(isNavigationState({routes: [{name: 'Main'}]})).toBe(false);
});

it('restores the signed-in tree but never auth or onboarding stacks', () => {
  expect(sanitizeRestoredState(mainState)).toEqual(mainState);
  expect(
    sanitizeRestoredState({index: 0, routes: [{key: 'auth', name: 'ProfessionalType'}]}),
  ).toBeUndefined();
  expect(
    sanitizeRestoredState({index: 0, routes: [{key: 'setup', name: 'IdentitySetup'}]}),
  ).toBeUndefined();
});

it('round-trips state for the same account only', async () => {
  await AsyncStorage.setItem(
    'nahtreek-pro-nav-state-v1',
    JSON.stringify({account: 'pro-1', state: mainState}),
  );
  expect(await loadPersistedNavigationState('pro-1')).toEqual(mainState);
  expect(await loadPersistedNavigationState('pro-2')).toBeUndefined();
  expect(await loadPersistedNavigationState('signed-out')).toBeUndefined();
});

it('ignores corrupt storage and survives storage failures', async () => {
  await AsyncStorage.setItem('nahtreek-pro-nav-state-v1', 'not-json{');
  expect(await loadPersistedNavigationState('pro-1')).toBeUndefined();
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('locked'));
  expect(await loadPersistedNavigationState('pro-1')).toBeUndefined();
  jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('locked'));
  await expect(clearPersistedNavigationState()).resolves.toBeUndefined();
});

it('clears stored navigation on sign-out', async () => {
  await AsyncStorage.setItem(
    'nahtreek-pro-nav-state-v1',
    JSON.stringify({account: 'pro-1', state: mainState}),
  );
  await clearPersistedNavigationState();
  expect(await loadPersistedNavigationState('pro-1')).toBeUndefined();
});
