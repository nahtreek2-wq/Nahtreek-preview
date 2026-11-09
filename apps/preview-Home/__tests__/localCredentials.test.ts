jest.mock('../src/config/runtime', () => ({
  runtimeConfig: {environment: 'staging'},
}));
jest.mock('../src/services/config', () => ({isApiConfigured: false}));
import {createHash} from 'crypto';
import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginLocalAccount,
  registerLocalAccount,
  resetLocalPassword,
  syncLocalAccountProfile,
  validateRegistration,
  type ClientRegistration,
} from '../src/services/localCredentials';
const form: ClientRegistration = {
  fullName: 'Client QA',
  address: '12 Test Street',
  city: 'Chennai',
  state: 'Tamil Nadu',
  postalCode: '600001',
  phoneNumber: '9000012345',
  email: 'qa@example.com',
  password: 'Correct test password',
  acceptedTerms: true,
};
let stored: string | null = null;
const hash = (password: string) =>
  createHash('sha256')
    .update('mock-only-salt:' + password)
    .digest('hex');
beforeEach(async () => {
  stored = null;
  await AsyncStorage.clear();
  NativeModules.NahtreekRuntimeConfig = {
    getLocalAccounts: jest.fn(async () => stored),
    setLocalAccounts: jest.fn(async (raw: string) => {
      stored = raw;
    }),
    hashLocalPassword: jest.fn(async (password: string) => ({
      salt: 'mock-salt',
      hash: hash(password),
    })),
    verifyLocalPassword: jest.fn(
      async (password: string, _salt: string, expected: string) =>
        hash(password) === expected,
    ),
    confirmLocalPasswordReset: jest.fn(async () => true),
  };
});
it('requires credentials and consent before profile setup', () => {
  expect(validateRegistration(form)).toBeNull();
  expect(validateRegistration({...form, acceptedTerms: false})).toContain(
    'notice',
  );
  expect(validateRegistration({...form, postalCode: '123'})).toBeNull();
});
it('stores only a native-derived password hash and signs in by email or mobile', async () => {
  await registerLocalAccount(form);
  expect(stored).not.toContain(form.password);
  await expect(
    loginLocalAccount('QA@example.com', form.password),
  ).resolves.toMatchObject({
    user: {
      homeCity: 'Chennai',
      email: 'qa@example.com',
      address: '12 Test Street',
      postalCode: '600001',
    },
  });
  await expect(loginLocalAccount('9000012345', 'incorrect')).rejects.toThrow(
    'incorrect',
  );
});
it('does not overwrite an existing mobile or email account', async () => {
  await registerLocalAccount(form);
  await expect(
    registerLocalAccount({...form, fullName: 'Other client'}),
  ).rejects.toThrow('already exists');
});
it('requires device confirmation to reset, then accepts only the new password', async () => {
  await registerLocalAccount(form);
  await resetLocalPassword(form.phoneNumber, form.email, 'New test password');
  expect(
    NativeModules.NahtreekRuntimeConfig.confirmLocalPasswordReset,
  ).toHaveBeenCalled();
  await expect(loginLocalAccount(form.email, form.password)).rejects.toThrow();
  await expect(
    loginLocalAccount(form.phoneNumber, 'New test password'),
  ).resolves.toBeTruthy();
});
it('keeps the old password if device confirmation is cancelled', async () => {
  await registerLocalAccount(form);
  NativeModules.NahtreekRuntimeConfig.confirmLocalPasswordReset.mockRejectedValueOnce(
    new Error('Cancelled'),
  );
  await expect(
    resetLocalPassword(form.phoneNumber, form.email, 'New test password'),
  ).rejects.toThrow('Cancelled');
  await expect(
    loginLocalAccount(form.email, form.password),
  ).resolves.toBeTruthy();
});
it('synchronizes edited contact details with password-login identifiers', async () => {
  const account = await registerLocalAccount(form);
  await syncLocalAccountProfile(account.user.id, {
    fullName: form.fullName,
    email: 'new@example.com',
  });
  await expect(
    loginLocalAccount('new@example.com', form.password),
  ).resolves.toBeTruthy();
  await expect(loginLocalAccount(form.email, form.password)).rejects.toThrow();
});
it('fails closed when the native credentials service is missing', async () => {
  NativeModules.NahtreekRuntimeConfig = undefined;
  await expect(registerLocalAccount(form)).rejects.toThrow('unavailable');
});
