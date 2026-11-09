import {nextCombinedPage, nextPage} from './pagination';

describe('pagination helpers', () => {
  it('returns the next page only while results remain', () => {
    expect(nextPage({page: 1, totalPages: 3})).toBe(2);
    expect(nextPage({page: 3, totalPages: 3})).toBeUndefined();
  });

  it('continues combined job feeds until both role feeds are exhausted', () => {
    expect(
      nextCombinedPage(1, {page: 1, totalPages: 1}, {page: 1, totalPages: 2}),
    ).toBe(2);
    expect(
      nextCombinedPage(2, {page: 2, totalPages: 2}, {page: 2, totalPages: 2}),
    ).toBeUndefined();
    expect(nextCombinedPage(1, null, undefined)).toBeUndefined();
  });
});
