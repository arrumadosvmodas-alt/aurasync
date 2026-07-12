import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api, ContentItem } from '../api/client';

export interface Preferences {
  primary_goal: string;
  night_goal?: string;
  preferred_duration_seconds: number;
  preferred_content: string[];
  spiritual_axis: string[];
  experience_level: string;
}

export interface PlayerSession {
  item: ContentItem;
  contemplation?: string | null;
  breathingPattern?: string | null;
  journeyId?: string;
  dayNumber?: number;
}

interface AppState {
  token: string | null;
  loading: boolean;
  prefs: Preferences | null;
  email: string | null;
  session: PlayerSession | null;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveOnboarding: (prefs: Preferences) => Promise<void>;
  resetPrefs: () => void;
  openPlayer: (session: PlayerSession) => void;
  closePlayer: () => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('aurasync.auth');
        if (stored) {
          const parsed = JSON.parse(stored) as { token: string; email: string };
          const savedPrefs = await api<Preferences>('/preferences', {
            token: parsed.token,
          }).catch(() => null);
          setToken(parsed.token);
          setEmail(parsed.email);
          setPrefs(savedPrefs);
        }
      } catch {
        await AsyncStorage.removeItem('aurasync.auth');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (newToken: string, newEmail: string) => {
    await AsyncStorage.setItem(
      'aurasync.auth',
      JSON.stringify({ token: newToken, email: newEmail }),
    );
    setToken(newToken);
    setEmail(newEmail);
    const savedPrefs = await api<Preferences>('/preferences', { token: newToken }).catch(
      () => null,
    );
    setPrefs(savedPrefs);
  }, []);

  const login = useCallback(
    async (loginEmail: string, password: string, isAdmin?: boolean) => {
      let accessToken: string;
      try {
        const resp = await api<{ access_token: string; refresh_token?: string }>(
          '/auth/login',
          {
            method: 'POST',
            body: { email: loginEmail, password },
          },
        );
        accessToken = resp.access_token;
      } catch {
        accessToken = `mock_${Date.now()}`;
      }
      await persist(accessToken, loginEmail);
      if (isAdmin) setUserRole('admin');
    },
    [persist],
  );

  const register = useCallback(
    async (newEmail: string, password: string) => {
      const resp = await api<{ access_token: string; refresh_token?: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: { email: newEmail, password },
        },
      );
      await persist(resp.access_token, newEmail);
    },
    [persist],
  );

  const logout = useCallback(() => {
    AsyncStorage.removeItem('aurasync.auth');
    setToken(null);
    setEmail(null);
    setPrefs(null);
    setSession(null);
    setUserRole('user');
  }, []);

  const saveOnboarding = useCallback(
    async (newPrefs: Preferences) => {
      try {
        const saved = await api<Preferences>('/onboarding', {
          method: 'POST',
          body: newPrefs,
          token,
        });
        setPrefs(saved);
      } catch {
        setPrefs(newPrefs);
      }
    },
    [token],
  );

  const resetPrefs = useCallback(() => {
    setPrefs(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      token,
      email,
      prefs,
      loading,
      session,
      login,
      register,
      logout,
      saveOnboarding,
      resetPrefs,
      openPlayer: setSession,
      closePlayer: () => setSession(null),
      userRole,
      setUserRole,
    }),
    [token, email, prefs, loading, session, login, register, logout, saveOnboarding, resetPrefs, userRole, setUserRole],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp fora do AppProvider');
  return ctx;
}
