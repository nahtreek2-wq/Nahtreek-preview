jest.mock('../src/config/runtime', () => ({
  runtimeConfig: {environment: 'staging'},
}));
jest.mock('../src/services/config', () => ({isApiConfigured: false}));
import React from 'react';
import renderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AccountAccessScreen} from '../src/screens/AccountAccessScreen';
import {Button, Input} from '../src/components/ui';
import * as credentials from '../src/services/localCredentials';
import {useSessionStore} from '../src/stores/session';
let screen: renderer.ReactTestRenderer;
beforeEach(async () => {
  useSessionStore.getState().clearSession();
  await renderer.act(async () => {
    screen = renderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: {x: 0, y: 0, width: 320, height: 640},
          insets: {top: 24, bottom: 0, left: 0, right: 0},
        }}>
        <AccountAccessScreen initialMode="create" />
      </SafeAreaProvider>,
    );
  });
});
afterEach(async () => {
  await renderer.act(async () => screen.unmount());
  jest.restoreAllMocks();
});
it('creates credentials first and opens profile setup after registration', async () => {
  useSessionStore.getState().enterGuestMode();
  jest.spyOn(credentials, 'registerLocalAccount').mockResolvedValue({
    accessToken: 'offline.qa',
    refreshToken: 'offline.qa',
    user: {
      id: 'offline-client-919000012345',
      fullName: 'New Client',
      phoneNumber: '+919000012345',
      email: 'qa@example.com',
      address: '',
      homeCity: '',
      state: '',
      postalCode: '',
      roles: ['CLIENT'],
    },
  });
  await renderer.act(async () => {
    input('Mobile number', '9000012345');
    input('Email address', 'qa@example.com');
    input('Password', 'Correct test password');
    input('Confirm password', 'Correct test password');
  });
  expect(
    screen.root
      .findAllByType(Input)
      .filter(node => /password/i.test(node.props.label))
      .every(node => node.props.secureTextEntry),
  ).toBe(true);
  const checkbox = screen.root.find(
    node => node.props.accessibilityRole === 'checkbox' && node.props.onPress,
  );
  await renderer.act(async () => checkbox.props.onPress());
  await renderer.act(async () => press('Create account'));
  expect(useSessionStore.getState().needsProfileSetup).toBe(true);
  expect(useSessionStore.getState().user).toMatchObject({
    fullName: 'New Client',
  });
});
function input(label: string, value: string) {
  screen.root
    .findAllByType(Input)
    .find(node => node.props.label === label)!
    .props.onChangeText(value);
}
function press(label: string) {
  screen.root
    .findAllByType(Button)
    .find(node => node.props.label === label)!
    .props.onPress();
}
it('starts with only mobile, email, and password credentials', () => {
  expect(
    screen.root.findAllByType(Input).map(node => node.props.label),
  ).toEqual([
    'Mobile number',
    'Email address',
    'Password',
    'Confirm password',
  ]);
});
it('rejects mismatched passwords before creating the account', async () => {
  await renderer.act(async () => {
    input('Mobile number', '9000012345');
    input('Email address', 'qa@example.com');
    input('Password', 'Correct test password');
    input('Confirm password', 'Different test password');
  });
  const checkbox = screen.root.find(
    node => node.props.accessibilityRole === 'checkbox' && node.props.onPress,
  );
  await renderer.act(async () => checkbox.props.onPress());
  await renderer.act(async () => press('Create account'));
  expect(JSON.stringify(screen.toJSON())).toContain(
    'The passwords do not match',
  );
});
