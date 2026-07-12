import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ImmersivePlayer } from './src/components/ImmersivePlayer';
import { AppProvider, useApp } from './src/context/AppContext';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { JourneysScreen } from './src/screens/JourneysScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MeditateScreen } from './src/screens/MeditateScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors, glass, rounded, TAB_ICONS, typography } from './src/theme';

const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: glass.borderColor,
          borderTopWidth: glass.borderWidth,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: typography.labelSm.fontFamily,
          fontSize: typography.labelSm.fontSize,
          fontWeight: typography.labelSm.fontWeight,
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <View
            style={{
              backgroundColor: focused ? colors.primaryContainer : 'transparent',
              borderRadius: rounded.full,
              padding: 6,
            }}
          >
            <MaterialCommunityIcons
              name={TAB_ICONS[route.name] as keyof typeof MaterialCommunityIcons.glyphMap}
              size={size - 4}
              color={color}
            />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Catálogo" component={CatalogScreen} />
      <Tab.Screen name="Meditar" component={MeditateScreen} />
      <Tab.Screen name="Jornadas" component={JourneysScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { token, prefs, loading, session } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      {!token ? (
        <LoginScreen />
      ) : !prefs ? (
        <OnboardingScreen />
      ) : (
        <NavigationContainer
          theme={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: colors.background,
              card: colors.surface,
              text: colors.onSurface,
              primary: colors.primary,
            },
          }}
        >
          <Tabs />
        </NavigationContainer>
      )}
      {session ? <ImmersivePlayer /> : null}
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
