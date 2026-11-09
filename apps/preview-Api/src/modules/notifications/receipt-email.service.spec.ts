import {ReceiptEmailService} from './receipt-email.service';

const message = {to: 'client@example.com', subject: 'Receipt', text: 'Paid ₹100'};
const rail = (enabled: boolean, send?: jest.Mock) => ({enabled, send: send ?? jest.fn().mockResolvedValue({id: 'mail'})});

describe('receipt email service', () => {
  it('prefers SMTP and skips Resend on success', async () => {
    const smtp = rail(true);
    const resend = rail(true);
    const result = await new ReceiptEmailService(smtp as any, resend as any).send(message);
    expect(result).toMatchObject({id: 'mail'});
    expect(smtp.send).toHaveBeenCalledWith(message);
    expect(resend.send).not.toHaveBeenCalled();
  });

  it('falls back to Resend when SMTP fails, and throws when nothing is left', async () => {
    const failing = rail(true, jest.fn().mockRejectedValue(new Error('smtp down')));
    const resend = rail(true);
    await new ReceiptEmailService(failing as any, resend as any).send(message);
    expect(resend.send).toHaveBeenCalledWith(message);
    const lone = rail(true, jest.fn().mockRejectedValue(new Error('smtp down')));
    await expect(new ReceiptEmailService(lone as any, rail(false) as any).send(message)).rejects.toThrow('smtp down');
  });

  it('uses Resend alone when SMTP is unconfigured', async () => {
    const resend = rail(true);
    const service = new ReceiptEmailService(rail(false) as any, resend as any);
    expect(service.enabled).toBe(true);
    await service.send(message);
    expect(resend.send).toHaveBeenCalledWith(message);
    expect(new ReceiptEmailService(rail(false) as any, rail(false) as any).enabled).toBe(false);
  });
});
