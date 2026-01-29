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
  surface: 'rgba(255, 255, 255, 0.95)',
  surfaceDark: 'rgba(40, 30, 25, 0.95)',
  background: '#FFFFFF',
  backgroundDark: '#1A1510',
  // Glass borders
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassBorderDark: 'rgba(255, 255, 255, 0.1)',
  // Secondary
  secondary: '#E07C2E',
  onSurface: '#1C1B1F',
  onSurfaceDark: '#E6E1E5',
  outline: 'rgba(0, 0, 0, 0.12)',
  outlineDark: 'rgba(255, 255, 255, 0.12)',
  // Chips
  chipSelected: 'rgba(232, 93, 0, 0.2)',
  chipSelectedDark: 'rgba(255, 140, 66, 0.25)',
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
