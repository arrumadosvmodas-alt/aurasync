export const colors = {
  background: '#040D43', // Hexaware Black/Darkest Blue
  surface: '#07125E', // Hexaware Dark Blue
  surfaceBright: '#121E6C', // Lighter container blue
  surfaceContainer: '#121E6C',
  surfaceContainerLow: '#07125E',
  surfaceContainerHigh: '#1D86FF', // Bright Blue
  surfaceContainerHighest: '#3C2CDA', // Hexaware Blue
  surfaceVariant: '#535983', // Border Dark
  onSurface: '#FFFFFF', // White text
  onSurfaceVariant: '#8088A7', // Silver text
  primary: '#3C2CDA', // Hexaware Blue primary
  onPrimary: '#FFFFFF',
  primaryContainer: '#07125E',
  onPrimaryContainer: '#FFFFFF',
  secondary: '#1D86FF', // Bright Blue
  onSecondary: '#FFFFFF',
  secondaryContainer: '#121E6C',
  onSecondaryContainer: '#1D86FF',
  tertiary: '#14CBDE', // Electric Blue accent
  onTertiary: '#FFFFFF',
  error: '#DA2D2C', // Error red
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#DA2D2C',
  outline: '#535983', // Border Dark
  outlineVariant: '#8088A7',
  /* backward compatibility aliases */
  accent: '#EA9D00', // Honey
  text: '#FFFFFF',
  textDim: '#8088A7',
  surfaceLight: '#121E6C',
  danger: '#DA2D2C',
};

export const typography = {
  headlineLg: {
    fontFamily: 'Manrope_300Light',
    fontSize: 30,
    fontWeight: '300' as const,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 31,
  },
  bodyLg: {
    fontFamily: 'Heebo_300Light',
    fontSize: 18,
    fontWeight: '300' as const,
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: 'Heebo_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  labelMd: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  labelSm: {
    fontFamily: 'Manrope_600SemiBold',
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
