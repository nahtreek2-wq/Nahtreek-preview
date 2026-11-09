import {allowsNotification, DEFAULT_NOTIFICATION_PREFERENCES, inTipHours} from './preferences';
import {PushService} from './push.service';

describe('notification preferences', () => {
  it('requires opt-in for tips and applies request/message switches independently', () => {
    expect(allowsNotification('offer', DEFAULT_NOTIFICATION_PREFERENCES)).toBe(false);
    expect(allowsNotification('message', {...DEFAULT_NOTIFICATION_PREFERENCES, requestUpdates: false})).toBe(true);
    expect(allowsNotification('request', {...DEFAULT_NOTIFICATION_PREFERENCES, requestUpdates: false})).toBe(false);
    expect(allowsNotification('verification', {...DEFAULT_NOTIFICATION_PREFERENCES, requestUpdates: false, messages: false})).toBe(true);
  });
  it('limits reminders to 9 am–8 pm India time', () => {
    expect(inTipHours(new Date('2026-09-25T03:29:00Z'))).toBe(false);
    expect(inTipHours(new Date('2026-09-25T03:30:00Z'))).toBe(true);
    expect(inTipHours(new Date('2026-09-25T14:30:00Z'))).toBe(false);
  });
  it('does not send an opted-out message', async () => {
    const db = {notificationPreference: {findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue({...DEFAULT_NOTIFICATION_PREFERENCES, messages: false})},
      serviceJourney: {findMany: jest.fn().mockResolvedValue([])},
      notification: {findMany: jest.fn().mockResolvedValue([{id: 'n', userId: 'u', kind: 'message'}]), updateMany: jest.fn().mockResolvedValue({count: 1}), update: jest.fn()}, pushDevice: {findMany: jest.fn()}};
    const fcm = {enabled: true, send: jest.fn()};
    await new PushService(db as any, fcm as any).dispatch();
    expect(fcm.send).not.toHaveBeenCalled();
    expect(db.notification.update).toHaveBeenCalledWith({where: {id: 'n'}, data: {pushState: 'SKIPPED', pushLeaseUntil: null}});
  });
  it('atomically claims each weekly reminder before creating it', async () => {
    const create = jest.fn();
    const updateMany = jest.fn().mockResolvedValueOnce({count: 1}).mockResolvedValueOnce({count: 0});
    const db = {notificationPreference: {findMany: jest.fn().mockResolvedValue([{userId: 'u', user: {roles: [{role: 'CLIENT'}]}}])},
      $transaction: (fn: any) => fn({notificationPreference: {updateMany}, notification: {create}})};
    const service = new PushService(db as any, {} as any);
    const time = new Date('2026-09-25T05:00:00Z');
    await (service as any).queueTips(time);
    await (service as any).queueTips(time);
    expect(create).toHaveBeenCalledTimes(1);
    expect(updateMany.mock.calls[0][0].where).toMatchObject({userId: 'u', offers: true});
  });
});
