jest.mock('../src/services/config', () => ({API_BASES: ['https://api.example.test/api/v1']}));
jest.mock('../src/services/secureSession', () => ({secureSession: {write: jest.fn().mockResolvedValue(undefined), clear: jest.fn().mockResolvedValue(undefined)}}));
import {api, ensureFreshSession, getAccessTokenExpiry} from '../src/services/apiClient';
import {useSessionStore} from '../src/stores/session';
const session = {accessToken: 'old', refreshToken: 'refresh', user: {id: 'client-1', fullName: 'Client', phoneNumber: '9000000000', roles: ['CLIENT']}};
const response = (status: number, body: unknown = {}) => ({status, ok: status >= 200 && status < 300, json: async () => body}) as Response;
const jwt = (exp: number | null) => `header.${Buffer.from(JSON.stringify(exp === null ? {sub: 'x'} : {sub: 'x', exp})).toString('base64url')}.signature`;
const freshJwt = () => jwt(Math.floor(Date.now() / 1000) + 600);
const expiringJwt = () => jwt(Math.floor(Date.now() / 1000) + 60);
beforeEach(() => {
  global.fetch = jest.fn();
  useSessionStore.getState().setSession(session);
});
it('shares one refresh for simultaneous expired-token requests', async () => {
  (fetch as jest.Mock).mockImplementation(async (url: string, options: RequestInit) => {
    if (url.endsWith('/auth/refresh')) return response(200, {...session, accessToken: 'new'});
    return (options.headers as Record<string, string>).Authorization === 'Bearer new' ? response(200, {ok: true}) : response(401);
  });
  await Promise.all([api.get('/one'), api.get('/two')]);
  expect((fetch as jest.Mock).mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
});
it('preserves the session after a network failure during refresh', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(401)).mockRejectedValueOnce(new TypeError('ECONNRESET'));
  await expect(api.get('/one')).rejects.toThrow('Check your internet');
  expect(useSessionStore.getState().refreshToken).toBe('refresh');
});
it('does not sign back in from a late refresh response after logout', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(401)).mockImplementationOnce(async () => {
    useSessionStore.getState().clearSession();
    return response(200, {...session, accessToken: 'new'});
  });
  await expect(api.get('/one')).rejects.toThrow('sign-in has expired');
  expect(useSessionStore.getState().accessToken).toBeNull();
});
it('maps raw server errors to customer language without leaking diagnostics', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(500, {message: 'PrismaError secret database path'}));
  await expect(api.post('/one')).rejects.toThrow('could not complete this action');
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('clears an explicitly rejected refresh session', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(401));
  await expect(api.get('/one')).rejects.toThrow('sign-in has expired');
  expect(useSessionStore.getState().accessToken).toBeNull();
});
it('shows actionable signup validation instead of hiding the reason', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(400, {message: ['Verification code expired. Request a new code.']}));
  await expect(api.post('/auth/register')).rejects.toThrow('Verification code expired');
});
it('does not retry a write or clear sign-in after a temporary database outage', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(503));
  await expect(api.post('/service-requests', {})).rejects.toThrow('temporarily unavailable');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(useSessionStore.getState().accessToken).toBe('old');
});
it('preserves the safe schedule suggestion when ASAP route estimates are unavailable', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(503, {
    message: 'Arrival estimates are unavailable. Please schedule a visit.',
  }));
  await expect(api.post('/service-workflow/matches', {})).rejects.toThrow(
    'Arrival estimates are unavailable. Please schedule a visit.',
  );
});
it('continues masking unexpected service-unavailable details', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(response(503, {
    message: 'Database credential or internal host detail',
  }));
  await expect(api.post('/service-workflow/matches', {})).rejects.toThrow(
    'temporarily unavailable',
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('reads expiry from a JWT access token and ignores opaque tokens', () => {
  const exp = Math.floor(Date.now() / 1000) + 600;
  expect(getAccessTokenExpiry(jwt(exp))).toBe(exp * 1000);
  expect(getAccessTokenExpiry(jwt(null))).toBeNull();
  expect(getAccessTokenExpiry('old')).toBeNull();
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
  expect(useSessionStore.getState()).toMatchObject({accessToken: expect.any(String), refreshToken: 'refresh'});
});
it('reports a dead session when a proactive refresh is rejected', async () => {
  useSessionStore.getState().setSession({...session, accessToken: expiringJwt()});
  (fetch as jest.Mock).mockResolvedValueOnce(response(401));
  await expect(ensureFreshSession()).resolves.toBe(false);
  expect(useSessionStore.getState().accessToken).toBeNull();
});
