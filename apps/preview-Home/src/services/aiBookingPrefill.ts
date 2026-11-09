// One-shot handoff from an NAHTREEK AI plan into the service booking form.
// The plan's service slug + summary prefill "What work is needed?" so the
// customer never retypes what they already told the AI. Module-level on
// purpose: the booking form mounts deep inside a BottomSheet, far from the
// AI screen that sets this. Entries expire so a stale plan never prefills a
// later, unrelated booking.
export type AiBookingPrefill = {serviceId: string; description: string; setAt: number};

let pending: AiBookingPrefill | null = null;

export function setAiBookingPrefill(serviceId: string, description: string) {
  pending = {serviceId, description, setAt: Date.now()};
}

// Returns the description only when it was meant for this service, and
// consumes it. Anything else leaves the entry untouched for its own form.
export function takeAiBookingPrefill(serviceId: string): string | null {
  if (!pending || pending.serviceId !== serviceId || Date.now() - pending.setAt > 30 * 60 * 1000) return null;
  const description = pending.description;
  pending = null;
  return description;
}

export function clearAiBookingPrefill() {
  pending = null;
}
