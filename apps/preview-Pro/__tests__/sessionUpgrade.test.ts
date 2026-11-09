import {useSessionStore} from '../src/stores/session';
import {secureSession} from '../src/services/secureSession';

jest.mock('../src/config/runtime', () => ({isApiConfigured: true}));
jest.mock('../src/services/secureSession', () => ({
  secureSession: {read: jest.fn(), write: jest.fn(), clear: jest.fn().mockResolvedValue(undefined)},
}));

const account = {id: 'professional-user', fullName: 'Professional', phoneNumber: '+919876543210', roles: ['SERVICE_PROVIDER']};

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({sessionEpoch: 0, accessToken: null, refreshToken: null, user: null, hydrated: false, storageError: null});
});

it('clears an old local preview session when the Professional app connects to the API', async () => {
  (secureSession.read as jest.Mock).mockResolvedValue(JSON.stringify({accessToken: 'offline.demo.service', refreshToken: 'offline.demo.service', user: account}));
  await useSessionStore.getState().hydrate();
  expect(useSessionStore.getState()).toMatchObject({hydrated: true, accessToken: null, user: null});
  expect(secureSession.clear).toHaveBeenCalledTimes(1);
});

it('restores a saved server session', async () => {
  (secureSession.read as jest.Mock).mockResolvedValue(JSON.stringify({accessToken: 'server-access', refreshToken: 'server-refresh', user: account}));
  await useSessionStore.getState().hydrate();
  expect(useSessionStore.getState().accessToken).toBe('server-access');
  expect(secureSession.clear).not.toHaveBeenCalled();
});
