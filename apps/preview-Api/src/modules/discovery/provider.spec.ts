import {DiscoveryService} from './discovery.service';

const profile = (over: Record<string, unknown> = {}) => ({id: 'prof-1', fullName: 'Eng Narayanan',
  avatarUrl: null, title: 'Civil Engineer', bio: null, baseCity: 'Chennai', baseState: 'TN',
  yearsOfExperience: 8, serviceCategories: ['PLUMBING'], averageRating: 4.5, totalReviewsCount: 2,
  verificationStatus: 'VERIFIED',
  reviewsReceived: [{id: 'r1', rating: 5, comment: 'Great work', createdAt: new Date('2026-01-02'),
    client: {fullName: 'Asha'}}], ...over});

function setup(prof: any) {
  const db: any = {professionalProfile: {
    findFirst: jest.fn().mockResolvedValue(prof),
    findUnique: jest.fn(async ({where}: any) => (where.reviewCode && prof?.reviewCode === where.reviewCode ? {id: prof.id} : null)),
  }};
  return {db, service: new DiscoveryService(db)};
}

describe('public provider reviews', () => {
  it('returns the public card with recent reviews', async () => {
    const {service} = setup(profile({memberPriority: true}));
    const result = await service.getProvider('prof-1');
    expect(result).toMatchObject({id: 'prof-1', fullName: 'Eng Narayanan', averageRating: 4.5,
      totalReviewsCount: 2, verificationStatus: 'VERIFIED', isMember: true});
    expect(result.reviews).toEqual([{id: 'r1', rating: 5, comment: 'Great work',
      createdAt: new Date('2026-01-02'), clientName: 'Asha'}]);
    expect(result).not.toHaveProperty('userId');
  });
  it('404s unknown providers', async () => {
    const {service} = setup(null);
    await expect(service.getProvider('missing')).rejects.toThrow('Professional not found');
  });
  it('resolves review codes case-insensitively', async () => {
    const {service} = setup(profile({reviewCode: 'AB23CD'}));
    await expect(service.getProviderByCode('ab23cd')).resolves.toEqual({professionalProfileId: 'prof-1'});
  });
  it('rejects malformed and unknown codes', async () => {
    const {service} = setup(profile({reviewCode: 'AB23CD'}));
    await expect(service.getProviderByCode('bad')).rejects.toThrow('6-character code');
    await expect(service.getProviderByCode('ZZ99ZZ')).rejects.toThrow('not recognized');
  });
});
