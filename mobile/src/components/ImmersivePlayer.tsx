import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { api, audioUrl } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, typography } from '../theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SLEEP_OPTIONS = [
  { mins: 0, label: 'Off' },
  { mins: 1, label: '1m' },
  { mins: 5, label: '5m' },
  { mins: 10, label: '10m' },
  { mins: 20, label: '20m' },
];

export function ImmersivePlayer() {
  const { session, closePlayer, token } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isFadeOutActive, setIsFadeOutActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Breathing simulation states inside player
  const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT'>('INHALE');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const breathAnim = useRef(new Animated.Value(1.0)).current;

  const item = session?.item;
  const resolvedAudioUrl = audioUrl(item);

  // Audio setup
  useEffect(() => {
    if (!item) return;
    startedAtRef.current = Date.now();
    let unmounted = false;

    (async () => {
      if (!resolvedAudioUrl) return;
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: resolvedAudioUrl },
          { isLooping: item.audio[0]?.is_loopable ?? true, shouldPlay: true },
          (status: AVPlaybackStatus) => {
            if (status.isLoaded) setPlaying(status.isPlaying);
          },
        );
        if (unmounted) {
          sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch (e) {
        setError('Não foi possível carregar o áudio.');
      }
    })();

    return () => {
      unmounted = true;
      if (timerRef.current) clearInterval(timerRef.current);
      const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      if (token && item) {
        api('/history', {
          method: 'POST',
          body: { content_item_id: item.id, seconds_played: seconds, completed: true },
          token,
        }).catch(() => undefined);
      }
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [item, resolvedAudioUrl, token]);

  // Breathing circle animation cycle (Inhale 4s -> Hold In 4s -> Exhale 4s -> Hold Out 4s)
  useEffect(() => {
    let timer: any;
    const cycle = () => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          let nextPhase: typeof breathPhase = 'INHALE';
          let duration = 4;
          if (breathPhase === 'INHALE') {
            nextPhase = 'HOLD_IN';
          } else if (breathPhase === 'HOLD_IN') {
            nextPhase = 'EXHALE';
          } else if (breathPhase === 'EXHALE') {
            nextPhase = 'HOLD_OUT';
          } else {
            nextPhase = 'INHALE';
          }

          setBreathPhase(nextPhase);
          
          // Animate transition
          if (nextPhase === 'INHALE') {
            Animated.timing(breathAnim, {
              toValue: 1.7,
              duration: 4000,
              useNativeDriver: true,
            }).start();
          } else if (nextPhase === 'EXHALE') {
            Animated.timing(breathAnim, {
              toValue: 1.0,
              duration: 4000,
              useNativeDriver: true,
            }).start();
          } else if (nextPhase === 'HOLD_IN') {
            breathAnim.setValue(1.7);
          } else {
            breathAnim.setValue(1.0);
          }

          return duration;
        }
        return prev - 1;
      });
    };

    // Trigger initial animation
    Animated.timing(breathAnim, {
      toValue: 1.7,
      duration: 4000,
      useNativeDriver: true,
    }).start();

    timer = setInterval(cycle, 1000);
    return () => clearInterval(timer);
  }, [breathPhase]);

  // Sleep timer count down loop
  useEffect(() => {
    if (sleepMinutes <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsFadeOutActive(false);
      return;
    }

    setSecondsRemaining(sleepMinutes * 60);
    setIsFadeOutActive(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      setSecondsRemaining((prev) => {
        const nextSecs = prev - 1;
        if (nextSecs <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          soundRef.current?.stopAsync().catch(() => undefined);
          closePlayer();
          return 0;
        }

        // Trigger fade out in the last 15 seconds
        if (nextSecs <= 15) {
          setIsFadeOutActive(true);
          const vol = nextSecs / 15;
          soundRef.current?.setVolumeAsync(vol).catch(() => undefined);
        }
        return nextSecs;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sleepMinutes]);

  if (!session || !item) return null;

  const togglePlay = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  };

  const getBreathPhaseLabel = () => {
    switch (breathPhase) {
      case 'INHALE':
        return 'INSPIRAR';
      case 'HOLD_IN':
        return 'SEGURAR';
      case 'EXHALE':
        return 'EXPIRAR';
      case 'HOLD_OUT':
        return 'SEGURAR';
    }
  };

  const formatTimerText = () => {
    const displayMins = Math.floor(secondsRemaining / 60);
    const displaySecs = secondsRemaining % 60;
    const timeStr = `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
    return timeStr + (isFadeOutActive ? ' (Fade-out)' : '');
  };

  return (
    <View style={styles.overlay}>
      {/* Player Top Bar */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={closePlayer}>
          <MaterialCommunityIcons name="close" size={20} color="#1D1C16" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>PLAYER IMERSIVO</Text>
          <Text style={styles.headerTitleText}>
            {item.type === 'soundscape'
              ? 'Natureza'
              : item.type === 'binaural'
              ? 'Binaural'
              : item.type === 'breathing'
              ? 'Respiração'
              : 'Meditação'}
          </Text>
        </View>

        <Pressable style={styles.closeBtn} onPress={() => setIsFavorite(!isFavorite)}>
          <MaterialCommunityIcons
            name={isFavorite ? 'star' : 'star-outline'}
            size={20}
            color="#D0902F"
          />
        </Pressable>
      </View>

      {/* Central Area: Breathing circle + info */}
      <View style={styles.centralArea}>
        <View style={styles.breathCircleWrapper}>
          <Animated.View
            style={[
              styles.breathCircleGlow,
              { transform: [{ scale: breathAnim }] },
            ]}
          />
          <View style={styles.breathCircleInner}>
            <Text style={styles.breathPhaseText}>{getBreathPhaseLabel()}</Text>
            <Text style={styles.breathSecondsText}>{breathSeconds} s</Text>
          </View>
        </View>

        <Text style={styles.sessionTitle}>{item.title}</Text>
        <Text style={styles.sessionAxis}>
          Alinhamento Eixo Cósmico: {item.spiritual_axis?.[0] || 'Mindfulness'}
        </Text>
      </View>

      {/* Bottom Area: Sleep timer & media controls */}
      <View style={styles.bottomArea}>
        <View style={styles.sleepTimerContainer}>
          <View style={styles.sleepTimerHeader}>
            <View style={styles.sleepTimerTitleRow}>
              <MaterialCommunityIcons name="bed-clock" size={18} color="#D0902F" />
              <Text style={styles.sleepTimerLabel}>Timer de Sono:</Text>
            </View>
            <Text style={styles.sleepTimerValue}>
              {sleepMinutes > 0 ? formatTimerText() : 'Desativado'}
            </Text>
          </View>

          <View style={styles.sleepTimerOptions}>
            {SLEEP_OPTIONS.map((opt) => {
              const active = sleepMinutes === opt.mins;
              return (
                <Pressable
                  key={opt.mins}
                  style={[styles.timerChip, active && styles.timerChipActive]}
                  onPress={() => setSleepMinutes(opt.mins)}
                >
                  <Text style={[styles.timerChipText, active && styles.timerChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Media Play pause */}
        <Pressable
          style={styles.playPauseBtn}
          onPress={togglePlay}
          testID="player_toggle_btn"
        >
          {error ? (
            <MaterialCommunityIcons name="alert-circle" size={32} color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons
              name={playing ? 'pause' : 'play'}
              size={36}
              color="#FFFFFF"
            />
          )}
        </Pressable>

        <Text style={styles.audioLoopLabel}>ÁUDIO EM LOOP CONTÍNUO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FBF9F1', // Cosmic background (light warm cream)
    zIndex: 1000,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0902F',
    letterSpacing: 1.5,
    fontFamily: typography.labelSm.fontFamily,
  },
  headerTitleText: {
    fontSize: 12,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  centralArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  breathCircleWrapper: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  breathCircleGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(125, 160, 131, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(125, 160, 131, 0.3)',
  },
  breathCircleInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 2,
    borderColor: '#7DA083',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  breathPhaseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  breathSecondsText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D0902F',
    marginTop: 2,
    fontFamily: typography.headlineLg.fontFamily,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1C16',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: typography.headlineMd.fontFamily,
  },
  sessionAxis: {
    fontSize: 13,
    color: '#797869',
    textAlign: 'center',
    fontFamily: typography.bodyMd.fontFamily,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
  },
  sleepTimerContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sleepTimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepTimerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sleepTimerLabel: {
    fontSize: 12,
    color: '#1D1C16',
    fontFamily: typography.bodyMd.fontFamily,
  },
  sleepTimerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelSm.fontFamily,
  },
  sleepTimerOptions: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  timerChip: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerChipActive: {
    backgroundColor: '#7DA083',
    borderColor: 'transparent',
  },
  timerChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797869',
    fontFamily: typography.labelSm.fontFamily,
  },
  timerChipTextActive: {
    color: '#FFFFFF',
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#141E0D',
    borderWidth: 1,
    borderColor: 'rgba(208, 144, 47, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioLoopLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#797869',
    fontFamily: typography.labelSm.fontFamily,
  },
});
