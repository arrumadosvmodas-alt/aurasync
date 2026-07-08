import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

import { api, Recommendation } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return 'Bom dia';
  if (hour >= 12 && hour <= 17) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const { token, email, openPlayer } = useApp();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Recommendation[]>('/recommendations?limit=8', { token });
      setRecs(data);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.greeting}>
        {greeting()}
        {email ? `, ${email.split('@')[0]}` : ''}
      </Text>
      <Text style={styles.section}>Recomendado para agora</Text>
      {recs.map((rec) => (
        <ContentCard
          key={rec.item.id}
          item={rec.item}
          subtitle={rec.reasons[0]}
          onPress={() => openPlayer({ item: rec.item })}
        />
      ))}
      {!loading && recs.length === 0 ? (
        <Text style={styles.empty}>
          Sem recomendações ainda — verifique se o backend está no ar.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56 },
  greeting: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 18 },
  section: { color: colors.accent, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  empty: { color: colors.textDim, fontSize: 14 },
});
