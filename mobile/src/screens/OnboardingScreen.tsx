import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const QUESTIONS = [
  {
    key: 'goal',
    title: 'Qual seu objetivo principal?',
    multi: false,
    options: [
      { value: 'relaxation', label: 'Relaxar' },
      { value: 'sleep', label: 'Dormir melhor' },
      { value: 'meditation', label: 'Meditar' },
      { value: 'focus', label: 'Foco' },
      { value: 'spiritual', label: 'Elevação espiritual' },
      { value: 'breathing', label: 'Respiração' },
      { value: 'silence', label: 'Silêncio interior' },
    ],
  },
  {
    key: 'content',
    title: 'Qual tipo de experiência você prefere?',
    multi: true,
    options: [
      { value: 'music', label: 'Música' },
      { value: 'soundscape', label: 'Sons da natureza' },
      { value: 'meditation', label: 'Meditação guiada' },
      { value: 'binaural', label: 'Binaural' },
      { value: 'breathing', label: 'Respiração' },
    ],
  },
  {
    key: 'duration',
    title: 'Qual duração ideal?',
    multi: false,
    options: [
      { value: '180', label: '3 min' },
      { value: '300', label: '5 min' },
      { value: '600', label: '10 min' },
      { value: '1200', label: '20 min' },
      { value: '1800', label: '30+ min' },
    ],
  },
  {
    key: 'energy',
    title: 'Qual energia você busca?',
    multi: true,
    options: [
      { value: 'root', label: 'Aterramento' },
      { value: 'air', label: 'Leveza' },
      { value: 'fire', label: 'Clareza' },
      { value: 'ether', label: 'Expansão' },
      { value: 'night', label: 'Sono' },
      { value: 'light', label: 'Gratidão' },
      { value: 'water', label: 'Fluidez' },
    ],
  },
] as const;

export function OnboardingScreen() {
  const { saveOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[step];
  const selected = answers[question.key] ?? [];

  const toggle = (value: string) => {
    setAnswers((prev) => {
      const current = prev[question.key] ?? [];
      if (question.multi) {
        return {
          ...prev,
          [question.key]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [question.key]: [value] };
    });
  };

  const next = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveOnboarding({
        primary_goal: answers.goal?.[0] ?? 'relaxation',
        preferred_duration_seconds: parseInt(answers.duration?.[0] ?? '600', 10),
        preferred_content: answers.content ?? [],
        spiritual_axis: answers.energy ?? [],
        experience_level: 'beginner',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {step + 1} de {QUESTIONS.length}
      </Text>
      <Text style={styles.title}>{question.title}</Text>
      <ScrollView style={styles.options} contentContainerStyle={{ gap: 10 }}>
        {question.options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => toggle(option.value)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
        onPress={next}
        disabled={selected.length === 0 || busy}
      >
        <Text style={styles.buttonText}>
          {step < QUESTIONS.length - 1 ? 'Continuar' : 'Começar'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 28, paddingTop: 64 },
  progress: { color: colors.accent, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 20 },
  options: { flex: 1 },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  optionText: { color: colors.textDim, fontSize: 16 },
  optionTextActive: { color: colors.text, fontWeight: '600' },
  error: { color: colors.danger, marginBottom: 8 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
