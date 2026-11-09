import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {EmailError, OutgoingEmail} from './email.provider';

// Gmail SMTP sender over nodemailer. Enabled by the GMAIL_SMTP_* env vars
// already on the server; the receipt service prefers it and keeps Resend
// as the fallback. Same best-effort contract as the Resend provider:
// failures surface as EmailError for the caller to swallow.
@Injectable()
export class SmtpEmailProvider {
  get enabled() {
    return Boolean(process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD);
  }

  async send(message: OutgoingEmail): Promise<{id?: string}> {
    const user = process.env.GMAIL_SMTP_USER;
    const pass = process.env.GMAIL_SMTP_APP_PASSWORD;
    if (!user || !pass) throw new EmailError('Email is not configured', 503, false);
    const fromName = process.env.GMAIL_FROM_NAME || 'NAHTREEK';
    try {
      const transport = nodemailer.createTransport({service: 'gmail', auth: {user, pass}});
      const info = await transport.sendMail({from: `${fromName} <${user}>`,
        to: message.to, subject: message.subject, text: message.text});
      return {id: info?.messageId};
    } catch (error) {
      throw new EmailError(error instanceof Error ? error.message : 'Email request failed', 503, true);
    }
  }
}
