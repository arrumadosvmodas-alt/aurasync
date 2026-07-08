import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { api, ContentItem } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function MeditateScreen() {
  const { openPlayer } = useApp();
  const [meditations, setMeditations] = useState<ContentItem[]>([]);
  const [breathing, setBreathing] = useState<ContentItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [med, breath] = await Promise.all([
          api<ContentItem[]>('/catalog?type=meditation'),
          api<ContentItem[]>('/catalog?type=breathing'),
        ]);
        setMeditations(med);
        setBreathing(breath);
      } catch {
        setMeditations([]);
        setBreathing([]);
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meditar</Text>

      <Text style={styles.section}>Respiração consciente</Text>
      {breathing.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          subtitle={item.description ?? undefined}
          onPress={() => openPlayer({ item })}
        />
      ))}

      <Text style={styles.section}>Meditações guiadas</Text>
      {meditations.length > 0 ? (
        meditations.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            subtitle={item.description ?? undefined}
            onPress={() => openPlayer({ item })}
          />
        ))
      ) : (
        <Text style={styles.empty}>
          As meditações guiadas com narração chegam na próxima fase de curadoria
          de conteúdo. Enquanto isso, explore as práticas de respiração e as
          sessões binaurais.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 18 },
  section: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 10,
  },
  empty: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
});
