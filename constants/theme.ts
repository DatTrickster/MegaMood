/**
 * Liquid glass + MegaMood orange theme.
 * Offline-first MegaMood – no cloud, no passwords.
 */
export const colors = {
  // MegaMood orange palette
  primary: '#E85D00',
  primaryLight: '#FF8C42',
  primaryDark: '#C2410C',
  onPrimary: '#FFFFFF',
  // Sunrise / accent
  accent: '#FFB088',
  accentSoft: '#FFE4B5',
  // Material-inspired surface
  surface: 'rgba(250, 249, 247, 0.95)',
  surfaceDark: '#161b22',
  background: '#F9F8F6',
  backgroundDark: '#0d1117',
  // Glass borders
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassBorderDark: 'rgba(255, 255, 255, 0.08)',
  // Secondary
  secondary: '#E07C2E',
  onSurface: '#1C1B1F',
  onSurfaceDark: '#e6edf3',
  outline: 'rgba(0, 0, 0, 0.12)',
  outlineDark: '#30363d',
  // Chips
  chipSelected: 'rgba(232, 93, 0, 0.2)',
  chipSelectedDark: 'rgba(255, 140, 66, 0.18)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  // Material-style scale
  headlineLarge: { fontSize: 28, fontWeight: '600' as const },
  headlineMedium: { fontSize: 24, fontWeight: '600' as const },
  titleLarge: { fontSize: 20, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, fontWeight: '500' as const },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Liquid glass card style (shared)
export const glassCard = {
  borderRadius: borderRadius.lg,
  borderWidth: 1,
  overflow: 'hidden',
  padding: spacing.lg,
} as const;

// Card shadow so sections stand out from background (iOS shadow + Android elevation)
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.14,
  shadowRadius: 8,
  elevation: 4,
} as const;

// Softer shadow for weather cards (avoids hard left/bottom border look)
export const weatherCardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
} as const;
