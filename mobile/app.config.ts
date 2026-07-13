import { ExpoConfig } from 'expo/config';

// Exposer variáveis de ambiente ao app via EXPO_PUBLIC_*
// Leia via: process.env.EXPO_PUBLIC_API_URL
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8010';

const config: ExpoConfig = {
  name: 'AuraSync',
  slug: 'aurasync',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.aurasync.mobile',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'app.aurasync.mobile',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    apiUrl,
    eas: {
      projectId: 'aurasync',
    },
  },
  plugins: [
    'expo-font',
  ],
};

export default config;
