import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api, ContentItem, Journey, JourneyStep } from '../api/client';
import { useApp } from '../context/AppContext';
import { AXIS_LABELS, colors } from '../theme';

interface Progress {
  journey_id: string;
  current_day: number;
  completed_days: number[];
}

export function JourneysScreen() {
  const { token, openPlayer } = useApp();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selected, setSelected] = useState<Journey | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    api<Journey[]>('/journeys')
      .then(setJourneys)
      .catch(() => setJourneys([]));
  }, []);

  const openJourney = useCallback(
    async (journey: Journey) => {
      setSelected(journey);
      setProgress(null);
      try {
        setProgress(await api<Progress>(`/journeys/${journey.id}/progress`, { token }));
      } catch {
        setProgress({ journey_id: journey.id, current_day: 1, completed_days: [] });
      }
    },
    [token],
  );

  const startStep = async (journey: Journey, step: JourneyStep) => {
    if (!step.content_item_id) return;
    try {
      const item = await api<ContentItem>(`/catalog/${step.content_item_id}`);
      openPlayer({
        item: { ...item, title: `${journey.title} — ${step.title}` },
        contemplation: step.contemplation_text,
        breathingPattern: step.breathing_pattern,
        journeyId: journey.id,
        dayNumber: step.day_number,
      });
      // registra o dia como concluído ao iniciar a prática
      await api(`/journeys/${journey.id}/progress`, {
        method: 'POST',
        body: { completed_day: step.day_number },
        token,
      });
      setProgress(await api<Progress>(`/journeys/${journey.id}/progress`, { token }));
    } catch {
      // mantém a jornada aberta mesmo se o registro de progresso falhar
    }
  };

  if (selected) {
    const completed = new Set(progress?.completed_days ?? []);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => setSelected(null)}>
          <Text style={styles.back}>← Jornadas</Text>
        </Pressable>
        <Text style={styles.title}>{selected.title}</Text>
        <Text style={styles.axis}>
          Eixo: {AXIS_LABELS[selected.spiritual_axis] ?? selected.spiritual_axis} ·{' '}
          {selected.total_days} dias
        </Text>
        {selected.objective ? (
          <Text style={styles.objective}>{selected.objective}</Text>
        ) : null}

        {selected.steps.map((step) => {
          const done = completed.has(step.day_number);
          const isNext = progress?.current_day === step.day_number;
          return (
            <Pressable
              key={step.id}
              style={[styles.step, isNext && styles.stepNext]}
              onPress={() => startStep(selected, step)}
            >
              <Text style={styles.stepStatus}>{done ? '✓' : isNext ? '›' : '·'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.contemplation_text ? (
                  <Text style={styles.stepPhrase} numberOfLines={1}>
                    “{step.contemplation_text}”
                  </Text>
                ) : null}
                {step.breathing_pattern ? (
                  <Text style={styles.stepBreath}>Respiração {step.breathing_pattern}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Jornadas</Text>
      <Text style={styles.subtitle}>
        Programas de 7 dias guiados pelos eixos espirituais.
      </Text>
      {journeys.map((journey) => (
        <Pressable
          key={journey.id}
          style={styles.card}
          onPress={() => openJourney(journey)}
        >
          <Text style={styles.cardTitle}>{journey.title}</Text>
          <Text style={styles.cardMeta}>
            {AXIS_LABELS[journey.spiritual_axis] ?? journey.spiritual_axis} ·{' '}
            {journey.total_days} dias · {journey.level === 'beginner' ? 'iniciante' : journey.level}
          </Text>
          {journey.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {journey.description}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56 },
  back: { color: colors.primary, fontSize: 15, marginBottom: 14 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: colors.textDim, fontSize: 14, marginBottom: 18 },
  axis: { color: colors.accent, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  objective: { color: colors.textDim, fontSize: 14, marginBottom: 18, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  cardMeta: { color: colors.primary, fontSize: 12, marginTop: 2 },
  cardDesc: { color: colors.textDim, fontSize: 13, marginTop: 6 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  stepNext: { borderWidth: 1, borderColor: colors.primary },
  stepStatus: { color: colors.accent, fontSize: 18, width: 20, textAlign: 'center' },
  stepTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  stepPhrase: { color: colors.textDim, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  stepBreath: { color: colors.primary, fontSize: 11, marginTop: 2 },
});
