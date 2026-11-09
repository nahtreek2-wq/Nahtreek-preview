import {Injectable} from '@nestjs/common';

export class EmailError extends Error {
  constructor(message: string, readonly status: number, readonly retryable: boolean) {
    super(message);
  }
}

export type OutgoingEmail = {to: string; subject: string; text: string};

// Thin Resend REST client over fetch (no SDK dependency), mirroring the
// billing provider. Receipts are best-effort: callers must never let email
// fail a payment, so every failure surfaces as EmailError for the caller to
// swallow after logging. Disabled until RESEND_API_KEY + EMAIL_FROM exist.
@Injectable()
export class EmailProvider {
  get enabled() {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  }

  async send(message: OutgoingEmail): Promise<{id?: string}> {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key || !from) throw new EmailError('Email is not configured', 503, false);
    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {method: 'POST', signal: AbortSignal.timeout(10000),
        headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({from, to: [message.to], subject: message.subject, text: message.text})});
    } catch {
      throw new EmailError('Email request failed', 503, true);
    }
    const data = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      const text = data?.message || `Email rejected (${response.status})`;
      throw new EmailError(text, response.status, response.status >= 500 || response.status === 429);
    }
    return data;
  }
}
