import {Colors} from '@nahtreek/design-system';

// Shared visual language for the same trade in both applications.
export const serviceIconography = {
  engineering: {icon: 'account-hard-hat', color: Colors.interactiveBlue, tint: Colors.softBlue},
  plumbing: {icon: 'pipe-wrench', color: Colors.teal, tint: Colors.tealBg},
  electrical: {icon: 'lightning-bolt', color: Colors.warning, tint: Colors.warningBg},
  painting: {icon: 'format-paint', color: Colors.warning, tint: Colors.warningBg},
  carpentry: {icon: 'hand-saw', color: Colors.warning, tint: Colors.warningBg},
  cleaning: {icon: 'spray-bottle', color: Colors.teal, tint: Colors.tealBg},
  service: {icon: 'hammer-wrench', color: Colors.warning, tint: Colors.warningBg},
} as const;

export function iconographyForService(title: string) {
  const value = title.toLowerCase();
  if (/engineer|structural|architect|design|survey|plan approval/.test(value)) {
    return serviceIconography.engineering;
  }
  if (value.includes('plumb')) {
    return serviceIconography.plumbing;
  }
  if (value.includes('electric')) {
    return serviceIconography.electrical;
  }
  if (value.includes('paint')) {
    return serviceIconography.painting;
  }
  if (value.includes('carpent') || value.includes('wood')) {
    return serviceIconography.carpentry;
  }
  if (value.includes('clean')) {
    return serviceIconography.cleaning;
  }
  if (/mason|brick|plaster/.test(value)) {
    return {icon: 'wall', color: Colors.warning, tint: Colors.warningBg};
  }
  if (/waterproof|damp|leak/.test(value)) {
    return {icon: 'water-outline', color: Colors.teal, tint: Colors.tealBg};
  }
  if (/inspect|maintenance|repair|renovat|supervision/.test(value)) {
    return serviceIconography.service;
  }
  if (/air condition|\bac\b|hvac/.test(value)) {
    return {icon: 'air-conditioner', color: Colors.interactiveBlue, tint: Colors.softBlue};
  }
  return serviceIconography.service;
}
