export const colors = {
  background: '#0b1326',
  surface: '#171f33',
  surfaceBright: '#31394d',
  surfaceContainer: '#171f33',
  surfaceContainerLow: '#131b2e',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  surfaceVariant: '#2d3449',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#ccc3d4',
  primary: '#d3bbff',
  onPrimary: '#3f0689',
  primaryContainer: '#4c1d95',
  onPrimaryContainer: '#b994ff',
  secondary: '#ffca45',
  onSecondary: '#3f2e00',
  secondaryContainer: '#e4ae00',
  onSecondaryContainer: '#5b4400',
  tertiary: '#89ceff',
  onTertiary: '#00344d',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  outline: '#958e9e',
  outlineVariant: '#4a4452',
  /* backward compatibility aliases */
  accent: '#ffca45',
  text: '#dae2fd',
  textDim: '#ccc3d4',
  surfaceLight: '#222a3d',
  danger: '#ffb4ab',
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
  background: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(211, 187, 255, 0.1)',
  borderWidth: 0.5,
};

export const TAB_ICONS: Record<string, string> = {
  Início: 'home',
  Explorar: 'compass-outline',
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
