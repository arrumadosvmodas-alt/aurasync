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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveOnboarding: (prefs: Preferences) => Promise<void>;
  openPlayer: (session: PlayerSession) => void;
  closePlayer: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PlayerSession | null>(null);

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
    async (loginEmail: string, password: string) => {
      const resp = await api<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password },
      });
      await persist(resp.access_token, loginEmail);
    },
    [persist],
  );

  const register = useCallback(
    async (newEmail: string, password: string) => {
      const resp = await api<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: { email: newEmail, password },
      });
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
  }, []);

  const saveOnboarding = useCallback(
    async (newPrefs: Preferences) => {
      const saved = await api<Preferences>('/onboarding', {
        method: 'POST',
        body: newPrefs,
        token,
      });
      setPrefs(saved);
    },
    [token],
  );

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
      openPlayer: setSession,
      closePlayer: () => setSession(null),
    }),
    [token, email, prefs, loading, session, login, register, logout, saveOnboarding],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp fora do AppProvider');
  return ctx;
}
