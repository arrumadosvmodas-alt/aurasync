import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useApp } from '../context/AppContext';
import { colors, typography } from '../theme';

const DAY_TITLES = [
  'Alinhamento de Energias',
  'Purificação do Soprar',
  'Liberação de Tensões',
  'Voo da Mente Cósmica',
  'Conexão de Eixos Interiores',
  'Consciência Transcendente',
  'Despertar Completo',
];

const DAY_SUBTITLES = [
  'Alinhe sua respiração com a gravidade',
  'Purifique a energia do seu corpo',
  'Deixe ir as pressões cotidianas',
  'Deixe a imaginação fluir livre',
  'Construa pontes entre mente e espírito',
  'Transmita paz e tranquilidade',
  'Integre-se com o todo universal',
];

const DAY_PHRASES = [
  '"A paz começa no momento em que você decide não permitir que outra pessoa ou evento controle suas emoções."',
  '"Abra espaço na sua mente para o silêncio. No silêncio, a verdade se revela espontaneamente."',
  '"Seja como a água. Flua livre de resistências e permita que o tempo cure o que está quebrado."',
  '"O universo reside dentro de cada respiração. Você é o todo experimentando a si mesmo."',
  '"Construa pontes invisíveis de perdão e união com todos os seres que cruzam sua órbita."',
  '"A tranquilidade não é a ausência de tempestades, mas a estabilidade espiritual em meio a elas."',
  '"Você atingiu a sincronização total. Desperte, brilhe e espalhe a harmonia cósmica."',
];

export function JourneysScreen() {
  const { openPlayer } = useApp();
  
  // Simulated Journey states
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  
  // Step indicator inside detail view (1 = Phrase, 2 = Breathing, 3 = Audio Loop)
  const [stepIndex, setStepIndex] = useState(1);

  // Pulse animation for breathing phase in Step 2 of detail view
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selectedDayIndex !== null && stepIndex === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [selectedDayIndex, stepIndex]);

  const resetJourney = () => {
    setCompletedDays([]);
  };

  const completeDay = (day: number) => {
    if (!completedDays.includes(day)) {
      setCompletedDays((prev) => [...prev, day]);
    }
    setSelectedDayIndex(null);
    setStepIndex(1);
  };

  const launchPlayerForDay = (day: number) => {
    const journeySessionItem = {
      id: `journey_day_${day}`,
      title: `Jornada Cósmica - Dia ${day}`,
      description: DAY_SUBTITLES[day - 1],
      type: 'meditation',
      spiritual_axis: ['Alinhamento'],
      mood_tags: ['Sem Foco'],
      duration_seconds: 900, // 15 mins
      is_premium: false,
      cover_image: {
        id: `journey_cover_${day}`,
        title: `Jornada Dia ${day}`,
        url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=400&auto=format&fit=crop',
        colors: ['#DDE6D5'],
        visual_tags: ['journey'],
        spiritual_axis: ['Alinhamento'],
        attribution: null,
      },
      audio: [
        {
          id: `journey_audio_${day}`,
          url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
          format: 'wav',
          is_loopable: true,
        },
      ],
      binaural: null,
      attributions: [],
    };

    openPlayer({
      item: journeySessionItem,
      contemplation: DAY_PHRASES[day - 1],
    });
  };

  const completedCount = completedDays.length;
  const progressPercent = completedCount / 7;

  // Render Detailed Day View
  if (selectedDayIndex !== null) {
    const dayNum = selectedDayIndex;
    return (
      <View style={styles.detailContainer}>
        {/* Day Detail Header */}
        <View style={styles.detailHeader}>
          <Pressable
            style={styles.closeBtn}
            onPress={() => {
              setSelectedDayIndex(null);
              setStepIndex(1);
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#1D1C16" />
          </Pressable>
          <Text style={styles.detailHeaderTitle}>DIA {dayNum} DE 7</Text>
          <View style={styles.closeBtnPlaceholder} />
        </View>

        {/* Content Card with Steps */}
        <View style={styles.detailCard}>
          {stepIndex === 1 && (
            <View style={styles.stepContent}>
              <MaterialCommunityIcons name="spa" size={48} color="#7DA083" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>A Frase Cósmica do Dia</Text>
              <Text style={styles.stepPhrase}>{DAY_PHRASES[dayNum - 1]}</Text>
            </View>
          )}

          {stepIndex === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Sincronização Respiratória Cósmica</Text>
              <View style={styles.breathCircleWrapper}>
                <Animated.View
                  style={[
                    styles.breathCircleGlow,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.breathCircleInner}>
                  <Text style={styles.breathCircleLabel}>Ar</Text>
                  <Text style={styles.breathCircleSub}>Sincronizar</Text>
                </View>
              </View>
              <Text style={styles.breathInstruction}>
                Siga o fluxo do círculo pulsante para acalmar seu sistema nervoso e expandir seus canais espirituais.
              </Text>
            </View>
          )}

          {stepIndex === 3 && (
            <View style={styles.stepContent}>
              <MaterialCommunityIcons name="waveform" size={48} color="#D0902F" style={styles.stepIcon} />
              <Text style={styles.stepTitle}>Áudio de Fundo Sintonizado</Text>
              <Text style={styles.audioSessionTitle}>
                Sinfonia Harmônica do Dia {dayNum}
              </Text>
              <Pressable
                style={styles.playerLaunchBtn}
                onPress={() => launchPlayerForDay(dayNum)}
              >
                <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.playerLaunchText}>Iniciar Player Imersivo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Step Navigation Bar */}
        <View style={styles.stepNavbar}>
          <Pressable
            style={[styles.navBtn, stepIndex === 1 && styles.navBtnDisabled]}
            disabled={stepIndex === 1}
            onPress={() => setStepIndex((s) => Math.max(1, s - 1))}
          >
            <Text style={[styles.navBtnText, stepIndex === 1 && styles.navBtnTextDisabled]}>
              Anterior
            </Text>
          </Pressable>

          <View style={styles.dotGroup}>
            {[1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.dot,
                  stepIndex === dot ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {stepIndex < 3 ? (
            <Pressable
              style={[styles.navBtn, styles.navBtnNext]}
              onPress={() => setStepIndex((s) => Math.min(3, s + 1))}
            >
              <Text style={styles.navBtnTextNext}>Próximo Step</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.navBtn, styles.navBtnComplete]}
              onPress={() => completeDay(dayNum)}
              testID="complete_journey_day_btn"
            >
              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              <Text style={styles.navBtnTextComplete}>Concluir Dia</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Render Journeys List View
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Jornada Cósmica de 7 Dias</Text>
      <Text style={styles.subtitle}>Progresso em tempo real e passos com respiração</Text>

      {/* Progress Summary Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressInfoRow}>
          <View>
            <Text style={styles.progressCardTitle}>Seu Alinhamento Espiritual</Text>
            <Text style={styles.progressCardSubtitle}>
              {completedCount} de 7 dias completos
            </Text>
          </View>
          <Text style={styles.progressPercent}>{Math.round(progressPercent * 100)}%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
        </View>

        {/* Reset Button */}
        <Pressable style={styles.resetBtn} onPress={resetJourney}>
          <MaterialCommunityIcons name="refresh" size={14} color="#7DA083" />
          <Text style={styles.resetBtnText}>Reiniciar Jornada</Text>
        </Pressable>
      </View>

      {/* Timeline heading */}
      <Text style={styles.timelineHeading}>CRONOGRAMA DO PERCURSO</Text>

      {/* Timeline Days List */}
      <View style={styles.daysList}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const isCompleted = completedDays.includes(day);
          return (
            <Pressable
              key={day}
              style={[styles.dayRow, isCompleted && styles.dayRowCompleted]}
              onPress={() => {
                setSelectedDayIndex(day);
                setStepIndex(1);
              }}
            >
              <View
                style={[
                  styles.dayBubble,
                  isCompleted ? styles.dayBubbleCompleted : styles.dayBubblePending,
                ]}
              >
                <Text style={[styles.dayBubbleText, isCompleted && styles.dayBubbleTextCompleted]}>
                  {day}
                </Text>
              </View>

              <View style={styles.dayDetails}>
                <Text style={styles.dayTitle}>Dia {day}: {DAY_TITLES[day - 1]}</Text>
                <Text style={styles.daySubtitle}>{DAY_SUBTITLES[day - 1]}</Text>
              </View>

              <View style={styles.dayArrow}>
                {isCompleted ? (
                  <MaterialCommunityIcons name="check" size={20} color="#2C5E3B" />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#7DA083" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.headlineMd.fontFamily,
  },
  subtitle: {
    fontSize: 12,
    color: '#797869',
    marginTop: 2,
    marginBottom: 20,
    fontFamily: typography.bodyMd.fontFamily,
  },
  progressCard: {
    backgroundColor: 'rgba(230, 225, 212, 0.95)',
    borderWidth: 0.5,
    borderColor: '#A8B59E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  progressCardSubtitle: {
    fontSize: 12,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.headlineMd.fontFamily,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7DA083',
    borderRadius: 4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(125, 160, 131, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 4,
  },
  resetBtnText: {
    fontSize: 11,
    color: '#7DA083',
    fontWeight: '600',
    fontFamily: typography.labelSm.fontFamily,
  },
  timelineHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797869',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: typography.labelMd.fontFamily,
  },
  daysList: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  dayRowCompleted: {
    borderColor: 'rgba(208, 144, 47, 0.4)',
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBubblePending: {
    backgroundColor: '#DDE6D5',
  },
  dayBubbleCompleted: {
    backgroundColor: 'rgba(208, 144, 47, 0.15)',
  },
  dayBubbleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.headlineLg.fontFamily,
  },
  dayBubbleTextCompleted: {
    color: '#D0902F',
  },
  dayDetails: {
    flex: 1,
    marginLeft: 16,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  daySubtitle: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  dayArrow: {
    paddingLeft: 8,
  },

  // Detail View Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#FBF9F1',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    justifyContent: 'space-between',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnPlaceholder: {
    width: 36,
  },
  detailHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelMd.fontFamily,
  },
  detailCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0902F',
    letterSpacing: 1.2,
    marginBottom: 12,
    fontFamily: typography.labelSm.fontFamily,
    textAlign: 'center',
  },
  stepPhrase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1C16',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: typography.bodyLg.fontFamily,
  },
  breathCircleWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  breathCircleGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(125, 160, 131, 0.15)',
  },
  breathCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDE6D5',
    borderWidth: 2,
    borderColor: '#141E0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathCircleLabel: {
    fontSize: 12,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  breathCircleSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
    marginTop: 2,
  },
  breathInstruction: {
    fontSize: 13,
    color: '#797869',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: typography.bodyMd.fontFamily,
  },
  audioSessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1C16',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: typography.headlineMd.fontFamily,
  },
  playerLaunchBtn: {
    flexDirection: 'row',
    backgroundColor: '#141E0D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
  },
  playerLaunchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelMd.fontFamily,
  },
  stepNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7DA083',
    borderRadius: 10,
  },
  navBtnDisabled: {
    borderColor: 'rgba(121, 120, 105, 0.3)',
  },
  navBtnText: {
    fontSize: 13,
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
  },
  navBtnTextDisabled: {
    color: '#797869',
  },
  navBtnNext: {
    backgroundColor: '#7DA083',
    borderColor: 'transparent',
  },
  navBtnTextNext: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelSm.fontFamily,
  },
  navBtnComplete: {
    backgroundColor: '#2C5E3B',
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtnTextComplete: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelSm.fontFamily,
  },
  dotGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#D0902F',
  },
  dotInactive: {
    backgroundColor: 'rgba(121, 120, 105, 0.3)',
  },
});
