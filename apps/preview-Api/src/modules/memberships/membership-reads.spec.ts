import {isPlusClient, plusClientIds} from './membership-reads';

const sub = (over: Record<string, unknown> = {}) => ({status: 'ACTIVE',
  currentPeriodEnd: new Date(Date.now() + 86400000), ...over});

describe('plus client reads', () => {
  it('flags running paid periods including the cancelled tail', async () => {
    for (const status of ['ACTIVE', 'PAST_DUE', 'CANCELLED']) {
      const db = {aiSubscription: {findUnique: jest.fn().mockResolvedValue(sub({status}))}};
      await expect(isPlusClient(db as any, 'user')).resolves.toBe(true);
      expect(db.aiSubscription.findUnique).toHaveBeenCalledWith({where: {userId: 'user'}});
    }
  });

  it('batches list flags and degrades to empty on failure', async () => {
    const db = {aiSubscription: {findMany: jest.fn().mockResolvedValue([
      {userId: 'plus', status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() + 86400000)},
      {userId: 'lapsed', status: 'EXPIRED', currentPeriodEnd: new Date(Date.now() - 1000)},
    ])}};
    await expect(plusClientIds(db as any, ['plus', 'lapsed', 'plus'])).resolves.toEqual(new Set(['plus']));
    expect(db.aiSubscription.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {userId: {in: ['plus', 'lapsed']}}}));
    await expect(plusClientIds({} as any, ['plus'])).resolves.toEqual(new Set());
    await expect(plusClientIds(db as any, [])).resolves.toEqual(new Set());
  });

  it('rejects expired, pending and missing subscriptions, and fails closed', async () => {
    const expired = {aiSubscription: {findUnique: jest.fn().mockResolvedValue(
      sub({status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() - 1000)}))}};
    await expect(isPlusClient(expired as any, 'user')).resolves.toBe(false);
    const pending = {aiSubscription: {findUnique: jest.fn().mockResolvedValue(sub({status: 'PENDING'}))}};
    await expect(isPlusClient(pending as any, 'user')).resolves.toBe(false);
    const none = {aiSubscription: {findUnique: jest.fn().mockResolvedValue(null)}};
    await expect(isPlusClient(none as any, 'user')).resolves.toBe(false);
    await expect(isPlusClient({} as any, 'user')).resolves.toBe(false);
  });
});
