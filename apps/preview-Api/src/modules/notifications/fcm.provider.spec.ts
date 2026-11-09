import {generateKeyPairSync} from 'crypto';
import {FcmProvider} from './fcm.provider';

describe('FCM HTTP v1 sender', () => {
  const originalFetch = global.fetch;
  const originalCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  beforeAll(() => {
    const {privateKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({project_id: 'test-project', client_email: 'sender@test-project.iam.gserviceaccount.com', private_key: privateKey.export({type: 'pkcs8', format: 'pem'})});
  });
  afterEach(() => {global.fetch = originalFetch;});
  afterAll(() => {if (originalCredentials === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON; else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalCredentials;});
  it('uses a short-lived OAuth token, caches it and sends safe event copy', async () => {
    const fetcher = jest.fn().mockResolvedValueOnce({ok: true, json: async () => ({access_token: 'test-token', expires_in: 3600})})
      .mockResolvedValue({ok: true});
    global.fetch = fetcher;
    const provider = new FcmProvider();
    expect(await provider.send('device', 'notification', 'request', 'Request accepted', 'Your professional is on the way.')).toBe('sent');
    expect(await provider.send('device2', 'notification')).toBe('sent');
    expect(fetcher.mock.calls.filter(([url]) => url === 'https://oauth2.googleapis.com/token')).toHaveLength(1);
    const assertion = fetcher.mock.calls[0][1].body.get('assertion');
    const claims = JSON.parse(Buffer.from(assertion.split('.')[1], 'base64url').toString());
    expect(claims.scope).toBe('https://www.googleapis.com/auth/firebase.messaging');
    expect(claims.exp - claims.iat).toBe(3600);
    expect(JSON.parse(fetcher.mock.calls[1][1].body).message.data).toEqual({notificationId: 'notification', kind: 'request', title: 'Request accepted', body: 'Your professional is on the way.'});
  });
  it.each([['UNREGISTERED', 'unregistered'], ['INVALID_ARGUMENT', 'retry']])('handles %s without removing unrelated valid tokens', async (code, expected) => {
    global.fetch = jest.fn().mockResolvedValueOnce({ok: true, json: async () => ({access_token: 'test-token'})})
      .mockResolvedValueOnce({ok: false, status: 400, json: async () => ({error: {details: [{errorCode: code}]}})});
    expect(await new FcmProvider().send('device', 'notification')).toBe(expected);
  });
});
