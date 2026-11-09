// City/state matching must survive formatting variants ("Tamil Nadu" vs
// "TamilNadu", case, punctuation) coming from pickers, GPS reverse-geocoding
// and free text. Both stored values and search input go through this before
// comparison. Mirrors the SQL backfill: lower() then strip non-alphanumerics.
export function normalizePlace(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
