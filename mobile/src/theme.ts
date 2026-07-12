export const colors = {
  background: '#FBF9F1', // Cosmic base warm cream
  surface: '#FFFFFF', // Clean white surface cards
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F5F3E7', // Warm cream container
  surfaceContainerLow: '#E6E1D4', // Warm sand/beige
  surfaceContainerHigh: '#DDE6D5', // Soft light green-tinted grey
  surfaceContainerHighest: '#C5D3C1',
  surfaceVariant: '#E6E1D4',
  onSurface: '#1D1C16', // Dark text
  onSurfaceVariant: '#797869', // Muted brown-grey text
  primary: '#141E0D', // Dark forest green-black primary
  onPrimary: '#FFFFFF',
  primaryContainer: '#DDE6D5', // Soft sage/olive light green container
  onPrimaryContainer: '#141E0D',
  secondary: '#D0902F', // Golden brown / accent
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F9ECD5',
  onSecondaryContainer: '#D0902F',
  tertiary: '#7DA083', // Sage green accent
  onTertiary: '#FFFFFF',
  error: '#EF4444',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#EF4444',
  outline: '#A8B59E', // Sage-grey border
  outlineVariant: '#E6E1D4',
  /* backward compatibility aliases */
  accent: '#D0902F',
  text: '#1D1C16',
  textDim: '#797869',
  surfaceLight: '#E6E1D4',
  danger: '#EF4444',
};

export const typography = {
  headlineLg: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 30,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 31,
  },
  bodyLg: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  labelMd: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  labelSm: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 17,
  },
};

export const rounded = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 12,
  md: 24,
  lg: 48,
  xl: 80,
  gutter: 24,
  marginMobile: 16,
};

export const glass = {
  background: 'rgba(255, 255, 255, 0.6)',
  borderColor: 'rgba(168, 181, 158, 0.3)',
  borderWidth: 0.5,
};

export const TAB_ICONS: Record<string, string> = {
  Início: 'home',
  Explorar: 'compass-outline',
  Catálogo: 'library',
  Meditar: 'meditation',
  Jornadas: 'map-outline',
  Perfil: 'account-outline',
};

export const AXIS_LABELS: Record<string, string> = {
  earth: 'Terra',
  water: 'Água',
  fire: 'Fogo',
  air: 'Ar',
  ether: 'Éter',
  light: 'Luz',
  night: 'Noite',
  root: 'Raiz',
  heart: 'Coração',
  sky: 'Céu',
};

export const TYPE_LABELS: Record<string, string> = {
  music: 'Música',
  meditation: 'Meditação',
  soundscape: 'Natureza',
  binaural: 'Binaural',
  breathing: 'Respiração',
};
