jest.mock('../src/config/runtime', () => ({runtimeConfig: {apiBaseUrl: 'https://api.example.test/api/v1'}}));
jest.mock('../src/services/secureSession', () => ({secureSession: {write: jest.fn().mockResolvedValue(undefined), clear: jest.fn().mockResolvedValue(undefined), read: jest.fn().mockResolvedValue(null)}}));

import {api, ensureFreshSession, getAccessTokenExpiry} from '../src/services/apiClient';
import {useSessionStore} from '../src/stores/session';

const user = {id: 'professional-1', fullName: 'Arun', phoneNumber: '+919000000000', roles: ['ENGINEER']};
const session = {accessToken: 'old-access', refreshToken: 'refresh-token', user};
const response = (status: number, body: unknown = {}) => ({status, ok: status >= 200 && status < 300, json: async () => body}) as Response;
const jwt = (exp: number | null) => `header.${Buffer.from(JSON.stringify(exp === null ? {sub: 'x'} : {sub: 'x', exp})).toString('base64url')}.signature`;
const freshJwt = () => jwt(Math.floor(Date.now() / 1000) + 600);
const expiringJwt = () => jwt(Math.floor(Date.now() / 1000) + 60);

beforeEach(() => {
  global.fetch = jest.fn();
  useSessionStore.setState({accessToken: null, refreshToken: null, user: null, hydrated: true, storageError: null});
  useSessionStore.getState().setSession(session);
});

it('shares one rotating refresh across simultaneous professional requests', async () => {
  (fetch as jest.Mock).mockImplementation(async (url: string, options: RequestInit) => {
    if (url.endsWith('/auth/refresh')) {return response(200, {...session, accessToken: 'new-access', refreshToken: 'new-refresh'});}
    return (options.headers as Record<string, string>).Authorization === 'Bearer new-access'
      ? response(200, {ok: true})
      : response(401);
  });
  await Promise.all([api.get('/professionals/me'), api.get('/service-requests')]);
  expect((fetch as jest.Mock).mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
  expect(useSessionStore.getState()).toMatchObject({accessToken: 'new-access', refreshToken: 'new-refresh'});
});

it('rejects a refreshed Client session inside the Professionals app', async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce(response(401))
    .mockResolvedValueOnce(response(200, {...session, accessToken: 'client-access', user: {...user, roles: ['CLIENT']}}));
  await expect(api.get('/professionals/me')).rejects.toThrow('professional sign-in');
  expect(useSessionStore.getState().accessToken).toBeNull();
});

it('preserves the current session after a transient refresh network failure', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(401)).mockRejectedValueOnce(new TypeError('offline'));
  await expect(api.get('/professionals/me')).rejects.toThrow('Check your internet');
  expect(useSessionStore.getState().refreshToken).toBe('refresh-token');
});

it('does not restore a professional session after sign-out during refresh', async () => {
  let finish!: (value: Response) => void;
  let started!: () => void;
  const refreshing = new Promise<void>(resolve => {started = resolve;});
  (fetch as jest.Mock).mockResolvedValueOnce(response(401)).mockImplementationOnce(() => {
    started(); return new Promise<Response>(resolve => {finish = resolve;});
  });
  const pending = api.get('/professionals/me');
  await refreshing;
  useSessionStore.getState().clear();
  finish(response(200, {...session, accessToken: 'new-access'}));
  await expect(pending).rejects.toThrow();
  expect(useSessionStore.getState().accessToken).toBeNull();
});

it('reads expiry from a JWT access token and ignores opaque tokens', () => {
  const exp = Math.floor(Date.now() / 1000) + 600;
  expect(getAccessTokenExpiry(jwt(exp))).toBe(exp * 1000);
  expect(getAccessTokenExpiry(jwt(null))).toBeNull();
  expect(getAccessTokenExpiry('old-access')).toBeNull();
  expect(getAccessTokenExpiry('not-a-token')).toBeNull();
});

it('leaves a fresh session alone without a refresh call', async () => {
  useSessionStore.getState().setSession({...session, accessToken: freshJwt()});
  await expect(ensureFreshSession()).resolves.toBe(true);
  expect(fetch).not.toHaveBeenCalled();
});

it('silently refreshes an expiring access token before any request fails', async () => {
  const next = freshJwt();
  useSessionStore.getState().setSession({...session, accessToken: expiringJwt()});
  (fetch as jest.Mock).mockResolvedValueOnce(
    response(200, {...session, accessToken: next, refreshToken: 'new-refresh'}),
  );
  await expect(ensureFreshSession()).resolves.toBe(true);
  expect((fetch as jest.Mock).mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
  expect(useSessionStore.getState()).toMatchObject({accessToken: next, refreshToken: 'new-refresh'});
});

it('keeps the session when a proactive refresh hits a transient failure', async () => {
  useSessionStore.getState().setSession({...session, accessToken: expiringJwt()});
  (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('offline'));
  await expect(ensureFreshSession()).resolves.toBe(true);
  expect(useSessionStore.getState()).toMatchObject({accessToken: expect.any(String), refreshToken: 'refresh-token'});
});

it('reports a dead session when a proactive refresh is rejected', async () => {
  useSessionStore.getState().setSession({...session, accessToken: expiringJwt()});
  (fetch as jest.Mock).mockResolvedValueOnce(response(401));
  await expect(ensureFreshSession()).resolves.toBe(false);
  expect(useSessionStore.getState().accessToken).toBeNull();
});
