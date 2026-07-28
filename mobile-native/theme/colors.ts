// Brand Colors — Aesthetic Pondok Indah
// Identik dengan design system PWA

export const colors = {
  // Primary Brand
  gold: '#C59E3F',
  goldDark: '#A37E28',
  goldLight: '#E8C96B',
  goldMuted: 'rgba(197, 158, 63, 0.15)',

  // Backgrounds
  cream: '#FAF8F5',
  creamDark: '#F4EFE4',
  white: '#FFFFFF',

  // Text
  charcoal: '#2C2416',
  charcoalMedium: '#5C5546',
  charcoalLight: '#8C7E6C',
  muted: '#B8AA98',

  // Borders
  border: '#E6DECB',
  borderLight: '#F0EBE1',

  // Feedback
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Membership Tiers
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  tierGold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',

  // Overlays
  overlay: 'rgba(44, 36, 22, 0.5)',
  overlayLight: 'rgba(44, 36, 22, 0.15)',
} as const;

export const fonts = {
  heading: 'serif',
  body: 'System',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;
