import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AXIS_LABELS, colors, TYPE_LABELS } from '../theme';

const GOAL_LABELS: Record<string, string> = {
  relaxation: 'Relaxar',
  sleep: 'Dormir melhor',
  meditation: 'Meditar',
  focus: 'Foco',
  spiritual: 'Elevação espiritual',
  breathing: 'Respiração',
  silence: 'Silêncio interior',
};

export function ProfileScreen() {
  const { email, prefs, logout, token, resetPrefs } = useApp();
  const [disclaimer, setDisclaimer] = useState('');
  const [historyCount, setHistoryCount] = useState<number | null>(null);

  useEffect(() => {
    api<{ disclaimer: string }>('/meta')
      .then((meta) => setDisclaimer(meta.disclaimer))
      .catch(() => undefined);
    api<unknown[]>('/history', { token })
      .then((rows) => setHistoryCount(rows.length))
      .catch(() => setHistoryCount(null));
  }, [token]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.email}>{email}</Text>

      {prefs ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suas preferências</Text>
          <Text style={styles.row}>
            Objetivo Diurno: {GOAL_LABELS[prefs.primary_goal] ?? prefs.primary_goal}
          </Text>
          <Text style={styles.row}>
            Objetivo Noturno: {prefs.night_goal ? (GOAL_LABELS[prefs.night_goal] ?? prefs.night_goal) : '—'}
          </Text>
          <Text style={styles.row}>
            Duração ideal: {Math.round(prefs.preferred_duration_seconds / 60)} min
          </Text>
          <Text style={styles.row}>
            Experiências: {prefs.preferred_content.map((c) => TYPE_LABELS[c] ?? c).join(', ') || '—'}
          </Text>
          <Text style={styles.row}>
            Eixos: {prefs.spiritual_axis.map((a) => AXIS_LABELS[a] ?? a).join(', ') || '—'}
          </Text>
        </View>
      ) : null}

      {historyCount !== null ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico</Text>
          <Text style={styles.row}>{historyCount} sessões recentes registradas</Text>
        </View>
      ) : null}

      <Pressable style={styles.resetButton} onPress={resetPrefs}>
        <Text style={styles.resetButtonText}>Alterar Objetivos</Text>
      </Pressable>

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>

      {disclaimer ? <Text style={styles.disclaimer}>{disclaimer}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  email: { color: colors.textDim, fontSize: 14, marginBottom: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  row: { color: colors.text, fontSize: 14, marginBottom: 4 },
  logout: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  resetButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  disclaimer: { color: colors.textDim, fontSize: 11, marginTop: 24, lineHeight: 16 },
});
