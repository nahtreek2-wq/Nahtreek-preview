import {normalizeServiceCategories} from '../src/services/platformQueries';

describe('normalizeServiceCategories', () => {
  it('accepts the API array and its paged data envelope', () => {
    const category = {
      id: 'database-id',
      slug: 'painting',
      title: ' Painting ',
      group: ' Home Services ',
      description: 'Painting work',
      prepare: 'Area and finish',
    };

    expect(normalizeServiceCategories([category])).toEqual([
      {...category, id: 'painting', title: 'Painting', group: 'Home Services'},
    ]);
    expect(normalizeServiceCategories({data: [category]})).toHaveLength(1);
  });

  it('ignores malformed records without throwing and excludes engineer-only categories', () => {
    expect(
      normalizeServiceCategories([
        null,
        {slug: 'missing-title', group: 'Home Services'},
        {slug: 'structural', title: 'Structural', group: 'Engineering & Structural'},
      ]),
    ).toEqual([]);
    expect(normalizeServiceCategories({unexpected: true})).toEqual([]);
  });
});
