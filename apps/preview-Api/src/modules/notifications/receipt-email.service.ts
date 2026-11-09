import {Injectable} from '@nestjs/common';
import {EmailProvider, OutgoingEmail} from './email.provider';
import {SmtpEmailProvider} from './smtp-email.provider';

// Receipt sender: Gmail SMTP first (credentials already live on the
// server), Resend as the fallback. Enabled when either rail is
// configured; throws only when every configured rail fails.
@Injectable()
export class ReceiptEmailService {
  constructor(private readonly smtp: SmtpEmailProvider, private readonly resend: EmailProvider) {}

  get enabled() {
    return this.smtp.enabled || this.resend.enabled;
  }

  async send(message: OutgoingEmail): Promise<{id?: string}> {
    if (this.smtp.enabled) {
      try {
        return await this.smtp.send(message);
      } catch (error) {
        if (!this.resend.enabled) throw error;
      }
    }
    return this.resend.send(message);
  }
}
