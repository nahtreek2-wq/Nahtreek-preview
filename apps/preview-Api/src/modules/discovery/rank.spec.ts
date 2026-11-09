import {haversineKm, scoreEngineer} from './rank';

describe('professional ranking', () => {
  it('ranks a top-rated available pro above an unrated one', () => {
    const top = scoreEngineer({averageRating: 4.8, totalReviewsCount: 30, isAvailable: true, memberPriority: true, yearsOfExperience: 8, distanceKm: 2});
    const weak = scoreEngineer({averageRating: 0, totalReviewsCount: 0, isAvailable: false, memberPriority: false, yearsOfExperience: 1, distanceKm: 40});
    expect(top.score).toBeGreaterThan(weak.score);
    expect(top.factors).toContain('Available now');
    expect(top.factors.join(' ')).toMatch(/rated/);
    expect(top.score).toBeLessThanOrEqual(100);
  });

  it('rewards nearby pros only when distance is known', () => {
    const near = scoreEngineer({averageRating: 4, totalReviewsCount: 5, isAvailable: true, memberPriority: false, yearsOfExperience: 3, distanceKm: 1});
    const far = scoreEngineer({averageRating: 4, totalReviewsCount: 5, isAvailable: true, memberPriority: false, yearsOfExperience: 3, distanceKm: 49});
    const unknown = scoreEngineer({averageRating: 4, totalReviewsCount: 5, isAvailable: true, memberPriority: false, yearsOfExperience: 3});
    expect(near.score).toBeGreaterThan(far.score);
    expect(near.factors.join(' ')).toMatch(/away/);
    expect(unknown.factors.join(' ')).not.toMatch(/away/);
  });

  it('caps every signal so one factor cannot dominate', () => {
    const star = scoreEngineer({averageRating: 5, totalReviewsCount: 500, isAvailable: true, memberPriority: true, yearsOfExperience: 30, distanceKm: 0});
    expect(star.score).toBeLessThanOrEqual(100);
  });

  it('computes sane city distances', () => {
    expect(haversineKm(13.0827, 80.2707, 13.0827, 80.2707)).toBe(0);
    const chennaiBengaluru = haversineKm(13.0827, 80.2707, 12.9716, 77.5946);
    expect(chennaiBengaluru).toBeGreaterThan(250);
    expect(chennaiBengaluru).toBeLessThan(350);
  });
});
