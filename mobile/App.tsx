import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ImmersivePlayer } from './src/components/ImmersivePlayer';
import { AppProvider, useApp } from './src/context/AppContext';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { JourneysScreen } from './src/screens/JourneysScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MeditateScreen } from './src/screens/MeditateScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Início: '☀',
  Explorar: '♫',
  Meditar: '☯',
  Jornadas: '➤',
  Perfil: '●',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceLight },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 16 }}>{TAB_ICONS[route.name] ?? '·'}</Text>
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
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
              text: colors.text,
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
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
