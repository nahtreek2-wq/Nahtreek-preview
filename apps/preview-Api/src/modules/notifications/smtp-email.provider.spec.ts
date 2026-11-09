jest.mock('nodemailer', () => ({createTransport: jest.fn()}));

import * as nodemailer from 'nodemailer';
import {SmtpEmailProvider} from './smtp-email.provider';

const createTransport = nodemailer.createTransport as unknown as jest.Mock;

function withEnv() {
  const prior = {user: process.env.GMAIL_SMTP_USER, pass: process.env.GMAIL_SMTP_APP_PASSWORD, name: process.env.GMAIL_FROM_NAME};
  process.env.GMAIL_SMTP_USER = 'sender@example.com';
  process.env.GMAIL_SMTP_APP_PASSWORD = 'app-pass';
  process.env.GMAIL_FROM_NAME = 'NAHTREEK Test';
  return () => {
    for (const [key, value] of [['GMAIL_SMTP_USER', prior.user], ['GMAIL_SMTP_APP_PASSWORD', prior.pass], ['GMAIL_FROM_NAME', prior.name]] as const) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  };
}

describe('smtp email provider', () => {
  beforeEach(() => createTransport.mockReset());

  it('stays disabled until the user and app password exist', () => {
    delete process.env.GMAIL_SMTP_USER;
    delete process.env.GMAIL_SMTP_APP_PASSWORD;
    expect(new SmtpEmailProvider().enabled).toBe(false);
    const restore = withEnv();
    try {
      expect(new SmtpEmailProvider().enabled).toBe(true);
    } finally {
      restore();
    }
  });

  it('sends through Gmail with the configured sender', async () => {
    const restore = withEnv();
    const sendMail = jest.fn().mockResolvedValue({messageId: 'smtp-1'});
    createTransport.mockReturnValue({sendMail});
    try {
      const result = await new SmtpEmailProvider().send({to: 'client@example.com', subject: 'Receipt', text: 'Paid ₹100'});
      expect(result).toMatchObject({id: 'smtp-1'});
      expect(createTransport).toHaveBeenCalledWith({service: 'gmail',
        auth: {user: 'sender@example.com', pass: 'app-pass'}});
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({from: 'NAHTREEK Test <sender@example.com>',
        to: 'client@example.com', subject: 'Receipt'}));
    } finally {
      restore();
    }
  });

  it('maps send failures to a retryable EmailError', async () => {
    const restore = withEnv();
    createTransport.mockReturnValue({sendMail: jest.fn().mockRejectedValue(new Error('auth failed'))});
    try {
      await expect(new SmtpEmailProvider().send({to: 'a@b.c', subject: 's', text: 't'}))
        .rejects.toMatchObject({message: 'auth failed', retryable: true});
    } finally {
      restore();
    }
  });
});
