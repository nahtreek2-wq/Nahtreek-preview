// Transparent professional ranking: one deterministic score per engineer so the
// best match for a customer always surfaces first. Same code runs on preview
// and production. Higher is better, capped at 100.
export type RankInput = {
  averageRating: number;
  totalReviewsCount: number;
  isAvailable: boolean;
  memberPriority: boolean;
  yearsOfExperience: number;
  nextSlotStartsAt?: Date | string | null;
  distanceKm?: number | null;
};

export function haversineKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const a = Math.sin(rad((toLat - fromLat) / 2)) ** 2 +
    Math.cos(rad(fromLat)) * Math.cos(rad(toLat)) * Math.sin(rad((toLng - fromLng) / 2)) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function scoreEngineer(input: RankInput, now = new Date()): {score: number; factors: string[]} {
  const factors: string[] = [];
  let score = 0;
  const rating = Math.max(0, Math.min(5, input.averageRating || 0));
  score += (rating / 5) * 30;
  const reviews = Math.max(0, input.totalReviewsCount || 0);
  score += Math.min(reviews / 25, 1) * 10;
  const years = Math.max(0, input.yearsOfExperience || 0);
  score += Math.min(years / 10, 1) * 10;
  if (input.isAvailable) score += 10;
  if (input.memberPriority) score += 10;
  let soonSlot = false;
  if (input.nextSlotStartsAt) {
    const hours = (new Date(input.nextSlotStartsAt).getTime() - now.getTime()) / 36e5;
    if (hours >= 0 && hours <= 72) {
      score += 5;
      soonSlot = true;
    }
  }
  let km: number | null = null;
  if (input.distanceKm !== null && input.distanceKm !== undefined && Number.isFinite(input.distanceKm)) {
    km = Math.max(0, input.distanceKm);
    score += Math.max(0, 1 - km / 50) * 15;
  }
  // Display order: most decision-relevant first.
  if (rating >= 4.5 && reviews >= 3) factors.push(`${rating.toFixed(1)} rated`);
  if (input.isAvailable) factors.push('Available now');
  if (km !== null && km <= 10) factors.push(km < 1 ? `${Math.round(km * 1000)} m away` : `${Math.round(km)} km away`);
  if (reviews >= 10) factors.push(`${reviews} reviews`);
  if (years >= 5) factors.push(`${years} yrs exp`);
  if (input.memberPriority) factors.push('Pro member');
  if (soonSlot) factors.push('Slot within 3 days');
  return {score: Math.round(score * 10) / 10, factors: factors.slice(0, 3)};
}
