import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

interface Phase {
  label: string;
  seconds: number;
  to: number;
}

/** Respiração visual: anima um círculo conforme o padrão (ex.: "4-7-8"). */
export function BreathingCircle({ pattern }: { pattern: string }) {
  const scale = useRef(new Animated.Value(0.55)).current;
  const [phaseLabel, setPhaseLabel] = useState('Inspire');

  const phases = useMemo<Phase[]>(() => {
    const parts = pattern
      .split('-')
      .map((p) => parseInt(p, 10))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (parts.length === 3) {
      return [
        { label: 'Inspire', seconds: parts[0], to: 1 },
        { label: 'Segure', seconds: parts[1], to: 1 },
        { label: 'Expire', seconds: parts[2], to: 0.55 },
      ];
    }
    if (parts.length === 4) {
      return [
        { label: 'Inspire', seconds: parts[0], to: 1 },
        { label: 'Segure', seconds: parts[1], to: 1 },
        { label: 'Expire', seconds: parts[2], to: 0.55 },
        { label: 'Pause', seconds: parts[3], to: 0.55 },
      ];
    }
    return [
      { label: 'Inspire', seconds: 4, to: 1 },
      { label: 'Expire', seconds: 6, to: 0.55 },
    ];
  }, [pattern]);

  useEffect(() => {
    let cancelled = false;
    let index = 0;

    const step = () => {
      if (cancelled) return;
      const phase = phases[index % phases.length];
      setPhaseLabel(phase.label);
      Animated.timing(scale, {
        toValue: phase.to,
        duration: phase.seconds * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          index += 1;
          step();
        }
      });
    };
    step();
    return () => {
      cancelled = true;
      scale.stopAnimation();
    };
  }, [phases, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.label}>{phaseLabel}</Text>
      <Text style={styles.pattern}>{pattern}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', height: 180 },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(127, 180, 217, 0.35)',
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'absolute',
  },
  label: { color: colors.text, fontSize: 18, fontWeight: '600' },
  pattern: { color: colors.textDim, fontSize: 12, marginTop: 4 },
});
