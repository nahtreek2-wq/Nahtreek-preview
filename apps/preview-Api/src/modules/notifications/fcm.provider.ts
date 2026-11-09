import {Injectable} from '@nestjs/common';
import {createSign} from 'crypto';

@Injectable()
export class FcmProvider {
  private cached?: {token: string; expiresAt: number};
  get enabled() {
    return process.env.PUSH_ENABLED === 'true' && Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  private credentials() {
    const value = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '{}');
    if (!value.project_id || !value.client_email || !value.private_key) throw new Error('Firebase configuration incomplete');
    return value as {project_id: string; client_email: string; private_key: string};
  }

  private async accessToken() {
    if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.token;
    const credentials = this.credentials();
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const payload = `${encode({alg: 'RS256', typ: 'JWT'})}.${encode({iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600})}`;
    const signature = createSign('RSA-SHA256').update(payload).sign(credentials.private_key, 'base64url');
    const response = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', signal: AbortSignal.timeout(5000),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${payload}.${signature}`})});
    const result = await response.json() as {access_token?: string; expires_in?: number};
    if (!response.ok || !result.access_token) throw new Error('Firebase authentication failed');
    this.cached = {token: result.access_token, expiresAt: Date.now() + (Math.max(60, result.expires_in ?? 3600) - 60) * 1000};
    return result.access_token;
  }

  async send(token: string, notificationId: string, kind?: string, title?: string, notificationBody?: string, extra?: Record<string, string>): Promise<'sent' | 'unregistered' | 'retry'> {
    try {
      const credentials = this.credentials();
      const accessToken = await this.accessToken();
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(credentials.project_id)}/messages:send`, {
        method: 'POST', signal: AbortSignal.timeout(5000),
        headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
        // Data-only: Android checks local sign-in before displaying a safe,
        // event-specific alert. Notification values must be strings in FCM data.
        body: JSON.stringify({message: {token, data: {notificationId, ...(kind ? {kind} : {}), ...(title ? {title: title.slice(0, 120)} : {}), ...(notificationBody ? {body: notificationBody.slice(0, 240)} : {}), ...(extra ?? {})}, android: {priority: kind === 'offer' ? 'normal' : 'high', ttl: '3600s'}}}),
      });
      if (response.ok) return 'sent';
      const body = await response.json() as {error?: {details?: {errorCode?: string}[]}};
      if (body.error?.details?.some(item => item.errorCode === 'UNREGISTERED')) return 'unregistered';
      if (response.status === 401) this.cached = undefined;
      return 'retry';
    } catch {
      return 'retry';
    }
  }
}
