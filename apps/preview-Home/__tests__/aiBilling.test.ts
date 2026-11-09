import {ApiError} from '../src/services/apiClient';
import {activateDemoAi, cancelAiSubscription, fetchAiSubscription, isPaywallError, quotaLabel, subscribeAi} from '../src/services/aiBilling';
import {api} from '../src/services/apiClient';
import RazorpayCheckout from 'react-native-razorpay';

jest.mock('../src/services/apiClient', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  api: {get: jest.fn(), post: jest.fn()},
}));
jest.mock('react-native-razorpay', () => ({__esModule: true, default: {open: jest.fn()}}));

const mockedApi = api as unknown as {get: jest.Mock; post: jest.Mock};
const mockedCheckout = RazorpayCheckout as unknown as {open: jest.Mock};

beforeEach(() => jest.clearAllMocks());

it.each([
  [null, null],
  [{effective: true, freeUsed: 0, freeQuota: 5}, null],
  [{effective: false, freeUsed: 0, freeQuota: 5}, '5 free AI chats left'],
  [{effective: false, freeUsed: 4, freeQuota: 5}, '1 free AI chat left'],
  [{effective: false, freeUsed: 5, freeQuota: 5}, '0 free AI chats left'],
  [{effective: false, freeUsed: 9, freeQuota: 5}, '0 free AI chats left'],
])('quota label for %j', (view, expected) => {
  expect(quotaLabel(view as any)).toBe(expected);
});

it('detects paywall errors by status code', () => {
  expect(isPaywallError(new ApiError(402, 'pay'))).toBe(true);
  expect(isPaywallError(new ApiError(400, 'bad'))).toBe(false);
  expect(isPaywallError(new Error('nope'))).toBe(false);
});

it('fetches and cancels through the billing endpoints', async () => {
  mockedApi.get.mockResolvedValue({effective: false});
  mockedApi.post.mockResolvedValue({effective: false, cancelAtPeriodEnd: true});
  await expect(fetchAiSubscription()).resolves.toEqual({effective: false});
  expect(mockedApi.get).toHaveBeenCalledWith('/ai-billing/me');
  await cancelAiSubscription();
  expect(mockedApi.post).toHaveBeenCalledWith('/ai-billing/cancel', {});
});

it('runs checkout then confirms with the API', async () => {
  mockedApi.post
    .mockResolvedValueOnce({keyId: 'rzp_test', subscriptionId: 'sub_ai'})
    .mockResolvedValueOnce({effective: true});
  mockedCheckout.open.mockResolvedValue({razorpay_subscription_id: 'sub_ai'});
  await expect(subscribeAi()).resolves.toEqual({effective: true});
  expect(mockedApi.post).toHaveBeenNthCalledWith(1, '/ai-billing/subscribe', {});
  expect(mockedCheckout.open).toHaveBeenCalledWith(expect.objectContaining({key: 'rzp_test', subscription_id: 'sub_ai'}));
  expect(mockedApi.post).toHaveBeenNthCalledWith(2, '/ai-billing/confirm', {});
});

it('does not confirm when checkout is dismissed', async () => {
  mockedApi.post.mockResolvedValueOnce({keyId: 'rzp_test', subscriptionId: 'sub_ai'});
  mockedCheckout.open.mockRejectedValue(new Error('dismissed'));
  await expect(subscribeAi()).rejects.toThrow('dismissed');
  expect(mockedApi.post).toHaveBeenCalledTimes(1);
});

it('activates preview access without opening checkout', async () => {
  mockedApi.post.mockResolvedValue({effective: true});
  await expect(activateDemoAi()).resolves.toEqual({effective: true});
  expect(mockedApi.post).toHaveBeenCalledWith('/ai-billing/demo-activate', {});
  expect(mockedCheckout.open).not.toHaveBeenCalled();
});
