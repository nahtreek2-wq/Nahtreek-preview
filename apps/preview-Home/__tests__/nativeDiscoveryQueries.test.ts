jest.mock('../src/services/config', () => ({isApiConfigured: true}));
jest.mock('../src/services/apiClient', () => ({
  api: {get: jest.fn().mockResolvedValue({data: [], meta: {page: 1, totalPages: 1}})},
  ApiError: class extends Error {},
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {api} from '../src/services/apiClient';
import {useServiceProviders} from '../src/services/platformQueries';
import {useSearch} from '../src/services/queries';

const {URLSearchParams: NativeURLSearchParams} = jest.requireActual<{
  URLSearchParams: typeof URLSearchParams;
}>('react-native/Libraries/Blob/URL');
const runtimeGlobal = global as unknown as {URLSearchParams: typeof URLSearchParams};
const originalURLSearchParams = runtimeGlobal.URLSearchParams;

beforeEach(() => {
  // Jest normally supplies Node's complete implementation. Android uses this
  // React Native implementation, whose .set() throws at runtime.
  runtimeGlobal.URLSearchParams = NativeURLSearchParams;
  jest.clearAllMocks();
});
afterEach(() => {
  runtimeGlobal.URLSearchParams = originalURLSearchParams;
});

it('opens provider discovery with native URL APIs and preserves filters and pagination', async () => {
  useServiceProviders('Coimbatore, Tamil Nadu', 'painting & repair', 'Tamil Nadu');
  const options = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
  await options.queryFn({pageParam: 2});
  expect(api.get).toHaveBeenCalledWith(
    '/discovery/providers?city=Coimbatore&state=Tamil%20Nadu&serviceId=painting%20%26%20repair&page=2',
  );
});

it('supports provider discovery without optional filters', async () => {
  useServiceProviders('');
  await (useInfiniteQuery as jest.Mock).mock.calls[0][0].queryFn({pageParam: 1});
  expect(api.get).toHaveBeenCalledWith('/discovery/providers?page=1');
});

it('searches with native URL APIs and encodes user text and location', async () => {
  useSearch('paint & repair', 'Coimbatore, Tamil Nadu', 'Tamil Nadu');
  await (useQuery as jest.Mock).mock.calls[0][0].queryFn();
  expect(api.get).toHaveBeenCalledWith(
    '/discovery/search?q=paint%20%26%20repair&city=Coimbatore&state=Tamil%20Nadu',
  );
});
