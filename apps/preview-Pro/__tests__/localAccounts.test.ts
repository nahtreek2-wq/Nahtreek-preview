jest.mock('../src/config/runtime', () => ({
  runtimeConfig: {environment: 'staging', apiBaseUrl: undefined},
  isApiConfigured: false,
}));
import {NativeModules} from 'react-native';
import {loginLocalProfessional, registerLocalProfessional} from '../src/services/localAccounts';

let stored: string | null;

beforeEach(() => {
  stored = null;
  NativeModules.NahtreekRuntimeConfig = {
    getLocalAccounts: jest.fn(async () => stored),
    setLocalAccounts: jest.fn(async (payload: string) => {stored = payload;}),
    hashLocalPassword: jest.fn(async (password: string) => ({salt: 'device-salt', hash: `hash:${password}`})),
    verifyLocalPassword: jest.fn(async (password: string, _salt: string, hash: string) => hash === `hash:${password}`),
    getLocalProfile: jest.fn(async () => null),
  };
});

it('creates and restores a device-local service professional account', async () => {
  const created = await registerLocalProfessional({
    phoneNumber: '9876543210',
    email: 'professional@example.com',
    password: 'SecurePass123',
    professionalType: 'SERVICE_PROFESSIONAL',
  });
  expect(created.user).toMatchObject({
    phoneNumber: '+919876543210',
    roles: ['SERVICE_PROVIDER'],
    needsProfessionalProfile: true,
  });
  const restored = await loginLocalProfessional('professional@example.com', 'SecurePass123');
  expect(restored.user.id).toBe(created.user.id);
});

it('does not open a local professional account with the wrong password', async () => {
  await registerLocalProfessional({
    phoneNumber: '9876543211',
    email: 'engineer@example.com',
    password: 'SecurePass123',
    professionalType: 'CIVIL_ENGINEER',
  });
  await expect(loginLocalProfessional('9876543211', 'wrong-password')).rejects.toThrow('incorrect');
});
