jest.mock('../src/config/runtime', () => ({
  isProductionRuntime: true,
  runtimeConfig: {environment: 'production', apiBaseUrl: undefined},
}));
jest.mock('../src/stores/session', () => ({
  useSessionStore: (selector: (state: {accessToken: null}) => unknown) => selector({accessToken: null}),
}));
const mockGetQueriesData = jest.fn((_filters?: {queryKey?: readonly unknown[]}) => [] as [unknown, unknown][]);
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({getQueriesData: mockGetQueriesData}),
  useInfiniteQuery: jest.fn(() => ({data: undefined, isPending: false, isError: true, isRefetching: false, refetch: jest.fn(), hasNextPage: false})),
  useQuery: jest.fn((options: {initialData?: unknown}) => ({
    data: options.initialData, isPending: false, isError: true,
    isRefetching: false, refetch: jest.fn(),
  })),
}));

import {useEngineList, useConversationsList, useNotificationsList, useFavoritesList, useEngineerDetail} from '../src/services/queries';

describe('production queries without loaded data', () => {
  it.each([useEngineList, useConversationsList, useNotificationsList, useFavoritesList])(
    'keeps lists safe to render without substituting reference records', hook => {
      const result = hook();
      expect(result.data).toEqual([]);
      expect(result.isError).toBe(true);
    },
  );
  it('does not manufacture a missing professional', () => {
    expect(useEngineerDetail('missing-professional').data).toBeUndefined();
  });
  it('opens a professional from the loaded discovery page cache', () => {
    const professional = {id: 'engineer-1', professionalProfileId: 'pro-1', fullName: 'Engineer'};
    mockGetQueriesData.mockImplementation(filters =>
      filters?.queryKey?.[0] === 'engineers'
        ? [[filters.queryKey, {pages: [{data: [professional]}]}]]
        : [],
    );
    expect(useEngineerDetail('engineer-1').data).toEqual(professional);
    mockGetQueriesData.mockImplementation(() => []);
  });
});
