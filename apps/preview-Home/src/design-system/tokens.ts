import {Colors} from '@nahtreek/design-system';

// Client (Home) accent: calm taxi-yellow (not gold, not neon) for home work.
// Yellow is fill-only with navy content (white fails AA on yellow); small
// text/icons on light surfaces use the dark-yellow variants. Icons and text
// on navy are white or accent, never boxed. Rating stars stay gold (semantic).
export const ClientColors = {
  primaryNavy: '#111F35',
  deepNavy: '#111F35',
  richNavy: '#103665',
  accent: '#FFC107',
  accentPressed: '#E5A800',
  accentSoft: '#FFF6DD',
  accentIcon: '#7A6100',
  accentText: '#7A6100',
  onAccent: '#111F35',
  veryLightBlue: '#F3F7FD',
  lightBackground: '#F7F9FC',
  white: '#FFFFFF',
  primaryText: '#172033',
  secondaryText: '#667085',
  border: '#E4E9F0',
  strongBorder: '#D0D7E2',
  success: Colors.success,
  warning: Colors.warning,
  information: Colors.info,
  error: Colors.error,
  mutedPlaceholder: '#667085',
} as const;

export const ClientSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;
