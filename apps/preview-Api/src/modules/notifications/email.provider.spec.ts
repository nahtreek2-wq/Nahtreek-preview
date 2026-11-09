import {EmailProvider} from './email.provider';

const KEY = 're_test_key';
const FROM = 'NAHTREEK <receipts@nahtreek.example>';

function withEnv() {
  const priorKey = process.env.RESEND_API_KEY;
  const priorFrom = process.env.EMAIL_FROM;
  process.env.RESEND_API_KEY = KEY;
  process.env.EMAIL_FROM = FROM;
  return () => {
    if (priorKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = priorKey;
    if (priorFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = priorFrom;
  };
}

describe('email provider', () => {
  it('stays disabled until the key and sender exist', () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect(new EmailProvider().enabled).toBe(false);
    const restore = withEnv();
    try {
      expect(new EmailProvider().enabled).toBe(true);
    } finally {
      restore();
    }
  });

  it('posts the receipt to Resend with bearer auth', async () => {
    const restore = withEnv();
    const send: jest.Mock = jest.fn(async () => ({ok: true, status: 200, json: async () => ({id: 'mail_1'})}));
    const priorFetch = global.fetch;
    (global as any).fetch = send;
    try {
      const result = await new EmailProvider().send({to: 'client@example.com', subject: 'Receipt', text: 'Paid ₹100'});
      expect(result).toMatchObject({id: 'mail_1'});
      expect(send).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({method: 'POST'}));
      const init = send.mock.calls[0][1] as any;
      expect(init.headers.Authorization).toBe(`Bearer ${KEY}`);
      expect(JSON.parse(init.body)).toMatchObject({from: FROM, to: ['client@example.com'], subject: 'Receipt'});
    } finally {
      (global as any).fetch = priorFetch;
      restore();
    }
  });

  it('maps provider rejections and network failure to EmailError', async () => {
    const restore = withEnv();
    const priorFetch = global.fetch;
    (global as any).fetch = jest.fn(async () => ({ok: false, status: 422, json: async () => ({message: 'Bad sender'})}));
    try {
      await expect(new EmailProvider().send({to: 'a@b.c', subject: 's', text: 't'})).rejects.toMatchObject({message: 'Bad sender', retryable: false});
    } finally {
      (global as any).fetch = priorFetch;
    }
    (global as any).fetch = jest.fn(async () => { throw new Error('down'); });
    try {
      await expect(new EmailProvider().send({to: 'a@b.c', subject: 's', text: 't'})).rejects.toMatchObject({status: 503, retryable: true});
    } finally {
      (global as any).fetch = priorFetch;
      restore();
    }
  });
});
