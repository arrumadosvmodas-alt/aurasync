import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useApp } from '../context/AppContext';
import { colors, typography } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TEMPLATES = [
  { name: 'Quadrada (Box)', pattern: [4, 4, 4, 4], phaseNames: ['Inspirar', 'Segurar', 'Expirar', 'Vazio'] },
  { name: 'Relaxante (4-7-8)', pattern: [4, 7, 8, 0], phaseNames: ['Inspirar', 'Segurar', 'Expirar', 'Vazio'] },
  { name: 'Coerência (5-5)', pattern: [5, 0, 5, 0], phaseNames: ['Inspirar', 'Segurar', 'Expirar', 'Vazio'] },
];

export function MeditateScreen() {
  const { openPlayer } = useApp();
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  // Breathing timer states
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  const activeTemplate = TEMPLATES[selectedTemplateIndex];

  // Pulse animation for the breathing glow background
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse effect synced with the breathing timer
  useEffect(() => {
    let timer: any;
    
    // Animate scale based on phase
    const phaseDurations = activeTemplate.pattern;
    const currentPhaseDuration = phaseDurations[currentPhaseIdx];

    if (currentPhaseIdx === 0) { // Inhale
      Animated.timing(pulseAnim, {
        toValue: 1.7,
        duration: currentPhaseDuration * 1000,
        useNativeDriver: true,
      }).start();
    } else if (currentPhaseIdx === 2) { // Exhale
      Animated.timing(pulseAnim, {
        toValue: 1.0,
        duration: currentPhaseDuration * 1000,
        useNativeDriver: true,
      }).start();
    } else if (currentPhaseIdx === 1) { // Hold In
      pulseAnim.setValue(1.7);
    } else { // Hold Out / Vazio
      pulseAnim.setValue(1.0);
    }

    // Set countdown timer
    setSecondsRemaining(currentPhaseDuration > 0 ? currentPhaseDuration : 4);

    const countdown = () => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Move to next phase that has a duration > 0
          let nextIdx = (currentPhaseIdx + 1) % 4;
          while (phaseDurations[nextIdx] === 0) {
            nextIdx = (nextIdx + 1) % 4;
          }
          setCurrentPhaseIdx(nextIdx);
          return phaseDurations[nextIdx];
        }
        return prev - 1;
      });
    };

    timer = setInterval(countdown, 1000);

    return () => clearInterval(timer);
  }, [currentPhaseIdx, selectedTemplateIndex]);

  // Play audio loop matching breathing template settings
  const startBreathingSession = () => {
    const breathingSessionItem = {
      id: 'breathing_999',
      title: `Sopro Vivo ${activeTemplate.name}`,
      description: `Exercício prático de respiração consciente de ${timerMinutes} minutos.`,
      type: 'breathing',
      spiritual_axis: ['Mindfulness'],
      mood_tags: ['Sem Foco'],
      duration_seconds: timerMinutes * 60,
      is_premium: false,
      cover_image: {
        id: 'cover_999',
        title: 'Respiração',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop',
        colors: ['#DDE6D5'],
        visual_tags: ['meditate'],
        spiritual_axis: ['Mindfulness'],
        attribution: null,
      },
      audio: [
        {
          id: 'audio_999',
          url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
          format: 'wav',
          is_loopable: true,
        },
      ],
      binaural: null,
      attributions: [],
    };

    openPlayer({
      item: breathingSessionItem,
      breathingPattern: activeTemplate.name,
    });
  };

  // Custom Slider Gesture handler helper
  const handleSliderTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const trackWidth = SCREEN_WIDTH - 64; // Horizontal margins
    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const minutes = 1 + Math.round(percentage * 19); // Range 1 to 20
    setTimerMinutes(minutes);
  };

  const getPhaseName = () => {
    const names = ['Inspirar (Expandir)', 'Segurar (Reter)', 'Expirar (Soltar)', 'Segurar (Vazio)'];
    return names[currentPhaseIdx];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Prática de Respiração</Text>
      <Text style={styles.subtitle}>Exercício interativo e controle de estresse</Text>

      {/* Interactive Breath Pebble visualizer */}
      <View style={styles.pebbleContainer}>
        <Animated.View
          style={[
            styles.glowBackdrop,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={styles.innerPebble}>
          <Text style={styles.pebblePhaseText}>
            {getPhaseName().split(' ')[0]}
          </Text>
          <Text style={styles.pebbleSecondsText}>{secondsRemaining} s</Text>
        </View>
      </View>

      {/* Preset templates selector */}
      <Text style={styles.sectionTitle}>SELECIONAR MODELO DE RESPIRAÇÃO</Text>
      <View style={styles.templatesGroup}>
        {TEMPLATES.map((tpl, idx) => {
          const selected = selectedTemplateIndex === idx;
          return (
            <Pressable
              key={tpl.name}
              style={[styles.templateBtn, selected && styles.templateBtnActive]}
              onPress={() => {
                setSelectedTemplateIndex(idx);
                setCurrentPhaseIdx(0);
              }}
            >
              <Text style={[styles.templateBtnText, selected && styles.templateBtnTextActive]}>
                {tpl.name.split(' ')[0]}
              </Text>
              <Text style={[styles.templateBtnPattern, selected && styles.templateBtnPatternActive]}>
                {tpl.name.includes('Box') ? '4-4-4-4' : tpl.name.includes('4-7-8') ? '4-7-8' : '5-5'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Timer duration custom slider */}
      <Text style={styles.sectionTitle}>DURAÇÃO DA SESSÃO</Text>
      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>Tempo:</Text>
        <Text style={styles.timerValue}>{timerMinutes} minutos</Text>
      </View>

      {/* Custom Slider track */}
      <Pressable
        style={styles.sliderTrackContainer}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleSliderTouch}
        onResponderMove={handleSliderTouch}
      >
        <View style={styles.sliderTrackBackground}>
          <View
            style={[
              styles.sliderTrackActive,
              { width: `${((timerMinutes - 1) / 19) * 100}%` },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              { left: `${((timerMinutes - 1) / 19) * 100}%` },
            ]}
          />
        </View>
      </Pressable>

      {/* Start Button */}
      <Pressable
        style={styles.startButton}
        onPress={startBreathingSession}
        testID="start_breathing_session_btn"
      >
        <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Iniciar Prática de Sopro</Text>
      </Pressable>
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
    alignItems: 'center',
    paddingBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141E0D',
    alignSelf: 'flex-start',
    fontFamily: typography.headlineMd.fontFamily,
  },
  subtitle: {
    fontSize: 12,
    color: '#797869',
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 24,
    fontFamily: typography.bodyMd.fontFamily,
  },
  pebbleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glowBackdrop: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(125, 160, 131, 0.18)',
  },
  innerPebble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDE6D5',
    borderWidth: 2,
    borderColor: '#141E0D',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pebblePhaseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.labelMd.fontFamily,
  },
  pebbleSecondsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D0902F',
    marginTop: 2,
    fontFamily: typography.headlineMd.fontFamily,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797869',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 10,
    fontFamily: typography.labelMd.fontFamily,
  },
  templatesGroup: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginBottom: 20,
  },
  templateBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBtnActive: {
    backgroundColor: '#7DA083',
    borderColor: 'transparent',
  },
  templateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
  },
  templateBtnTextActive: {
    color: '#FFFFFF',
  },
  templateBtnPattern: {
    fontSize: 9,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  templateBtnPatternActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#1D1C16',
    fontFamily: typography.bodyMd.fontFamily,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelMd.fontFamily,
  },
  sliderTrackContainer: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    marginBottom: 24,
  },
  sliderTrackBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#DDE6D5',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrackActive: {
    height: '100%',
    backgroundColor: '#7DA083',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D0902F',
    position: 'absolute',
    marginLeft: -10,
  },
  startButton: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    backgroundColor: '#141E0D',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelMd.fontFamily,
  },
});
