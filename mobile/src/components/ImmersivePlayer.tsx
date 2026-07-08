import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api, mediaUrl } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { BreathingCircle } from './BreathingCircle';

const SLEEP_TIMER_OPTIONS = [5, 10, 20];

/** Modo Imersivo: imagem em tela cheia, frase contemplativa, respiração visual,
 * player com loop e timer de sono com fade. */
export function ImmersivePlayer() {
  const { session, closePlayer, token } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const [playing, setPlaying] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const item = session?.item;
  const audioUrl = mediaUrl(item?.audio[0]?.url);

  useEffect(() => {
    if (!item) return;
    startedAtRef.current = Date.now();
    let unmounted = false;

    (async () => {
      if (!audioUrl) return;
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
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
      if (timerRef.current) clearTimeout(timerRef.current);
      const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      if (token && item) {
        api('/history', {
          method: 'POST',
          body: { content_item_id: item.id, seconds_played: seconds, completed: false },
          token,
        }).catch(() => undefined);
      }
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [item, audioUrl, token]);

  if (!session || !item) return null;

  const togglePlay = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    if (playing) await sound.pauseAsync();
    else await sound.playAsync();
  };

  const startSleepTimer = (minutes: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSleepMinutes(minutes);
    timerRef.current = setTimeout(async () => {
      // fade out de ~5s antes de parar
      const sound = soundRef.current;
      if (sound) {
        for (let v = 10; v >= 0; v -= 1) {
          await sound.setVolumeAsync(v / 10).catch(() => undefined);
          await new Promise((r) => setTimeout(r, 500));
        }
        await sound.pauseAsync().catch(() => undefined);
      }
      setSleepMinutes(null);
    }, minutes * 60 * 1000);
  };

  const cover = mediaUrl(item.cover_image?.url);

  return (
    <View style={styles.overlay}>
      {cover ? <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} /> : null}
      <View style={styles.scrim} />

      <Pressable style={styles.close} onPress={closePlayer}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {session.dayNumber ? (
          <Text style={styles.day}>Dia {session.dayNumber}</Text>
        ) : null}
        {session.contemplation ? (
          <Text style={styles.phrase}>“{session.contemplation}”</Text>
        ) : item.description ? (
          <Text style={styles.phrase}>{item.description}</Text>
        ) : null}

        {session.breathingPattern || item.type === 'breathing' ? (
          <BreathingCircle
            pattern={session.breathingPattern ?? item.description?.match(/\d+-\d+(-\d+)*/)?.[0] ?? '4-4-6'}
          />
        ) : null}

        {item.type === 'binaural' && item.binaural ? (
          <Text style={styles.binauralInfo}>
            {item.binaural.left_hz} Hz · {item.binaural.right_hz} Hz — batida percebida de{' '}
            {item.binaural.beat_hz} Hz{'\n'}Use fones de ouvido estéreo em volume confortável.
          </Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {audioUrl ? (
          <Pressable style={styles.playButton} onPress={togglePlay}>
            <Text style={styles.playIcon}>{playing ? '⏸' : '▶'}</Text>
          </Pressable>
        ) : null}

        {audioUrl ? (
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Timer de sono:</Text>
            {SLEEP_TIMER_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                style={[styles.timerChip, sleepMinutes === minutes && styles.timerChipActive]}
                onPress={() => startSleepTimer(minutes)}
              >
                <Text style={styles.timerChipText}>{minutes}m</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {item.attributions.length > 0 ? (
          <Text style={styles.attribution}>{item.attributions.join(' · ')}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    zIndex: 100,
  },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 20, 0.55)' },
  close: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.text, fontSize: 18 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 14,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  day: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  phrase: {
    color: colors.text,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.9,
    maxWidth: 420,
  },
  binauralInfo: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
  error: { color: colors.danger, fontSize: 14 },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(127, 180, 217, 0.3)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: colors.text, fontSize: 30 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerLabel: { color: colors.textDim, fontSize: 13 },
  timerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  timerChipActive: { backgroundColor: colors.primary },
  timerChipText: { color: colors.text, fontSize: 13 },
  attribution: { color: colors.textDim, fontSize: 10, textAlign: 'center', marginTop: 12 },
});
