import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api, mediaUrl, Recommendation } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, glass, rounded, spacing, typography } from '../theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return 'Bom dia';
  if (hour >= 12 && hour <= 17) return 'Boa tarde';
  return 'Boa noite';
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function HomeScreen() {
  const { token, email, openPlayer } = useApp();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  // Animação de pulso do indicador de respiração
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const load = useCallback(async () => {
    setLoading(false); // evita re-renders agressivos
    try {
      const data = await api<Recommendation[]>('/recommendations?limit=8', { token });
      setRecs(data);
    } catch {
      setRecs([]);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const userName = email ? capitalize(email.split('@')[0]) : 'Visitante';
  const heroItem = recs[0]?.item;
  const shortSessions = recs.slice(1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={async () => {
            setLoading(true);
            await load();
            setLoading(false);
          }}
          tintColor={colors.primary}
        />
      }
    >
      {/* 1. Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeSubtitle}>
          {greeting()}, {userName}
        </Text>
        <Text style={styles.welcomeTitle}>Encontre sua paz interior hoje</Text>
      </View>

      {/* 2. Recommended Hero Card */}
      {heroItem ? (
        <Pressable
          style={styles.heroCard}
          onPress={() => openPlayer({ item: heroItem })}
        >
          {heroItem.cover_image?.url ? (
            <ImageBackground
              source={{ uri: mediaUrl(heroItem.cover_image.url) }}
              style={styles.heroBg}
              imageStyle={styles.heroBgImage}
            >
              <View style={styles.heroOverlay}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagText}>Recomendado agora</Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.breathCircle,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                </View>

                <View style={styles.heroFooter}>
                  <Text style={styles.heroTitle}>{heroItem.title}</Text>
                  {heroItem.description ? (
                    <Text style={styles.heroDesc} numberOfLines={2}>
                      {heroItem.description}
                    </Text>
                  ) : null}

                  <View style={styles.heroActions}>
                    <View style={styles.playButton}>
                      <Text style={styles.playButtonIcon}>▶</Text>
                      <Text style={styles.playButtonText}>Começar Agora</Text>
                    </View>
                    {heroItem.duration_seconds ? (
                      <Text style={styles.heroDuration}>
                        🕒 {Math.round(heroItem.duration_seconds / 60)} min
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.heroFallback}>
              <View style={styles.heroHeader}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>Recomendado agora</Text>
                </View>
                <Animated.View
                  style={[
                    styles.breathCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              </View>
              <View style={styles.heroFooter}>
                <Text style={styles.heroTitle}>{heroItem.title}</Text>
                {heroItem.description ? (
                  <Text style={styles.heroDesc} numberOfLines={2}>
                    {heroItem.description}
                  </Text>
                ) : null}
                <View style={styles.heroActions}>
                  <View style={styles.playButton}>
                    <Text style={styles.playButtonIcon}>▶</Text>
                    <Text style={styles.playButtonText}>Começar Agora</Text>
                  </View>
                  {heroItem.duration_seconds ? (
                    <Text style={styles.heroDuration}>
                      🕒 {Math.round(heroItem.duration_seconds / 60)} min
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        </Pressable>
      ) : null}

      {/* 3. Quick Access Bento Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Acessos Rápidos</Text>
      </View>
      <View style={styles.bentoGrid}>
        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Explorar')}
        >
          <View style={[styles.bentoIconBg, { backgroundColor: 'rgba(137, 206, 255, 0.1)' }]}>
            <Text style={styles.bentoEmoji}>🌲</Text>
          </View>
          <Text style={styles.bentoText}>Natureza</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Explorar')}
        >
          <View style={[styles.bentoIconBg, { backgroundColor: 'rgba(211, 187, 255, 0.1)' }]}>
            <Text style={styles.bentoEmoji}>🎧</Text>
          </View>
          <Text style={styles.bentoText}>Binaural</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Meditar')}
        >
          <View style={[styles.bentoIconBg, { backgroundColor: 'rgba(255, 202, 69, 0.1)' }]}>
            <Text style={styles.bentoEmoji}>🫁</Text>
          </View>
          <Text style={styles.bentoText}>Respiração</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Meditar')}
        >
          <View style={[styles.bentoIconBg, { backgroundColor: 'rgba(76, 29, 149, 0.15)' }]}>
            <Text style={styles.bentoEmoji}>☯</Text>
          </View>
          <Text style={styles.bentoText}>Meditação</Text>
        </Pressable>
      </View>

      {/* 4. Recent Activities / Short Sessions */}
      <View style={styles.sessionHeaderContainer}>
        <Text style={styles.sectionTitle}>Sessões Curtas</Text>
        <Pressable onPress={() => navigation.navigate('Explorar')}>
          <Text style={styles.seeAllText}>Ver todas</Text>
        </Pressable>
      </View>

      <View style={styles.sessionList}>
        {shortSessions.map((rec) => (
          <Pressable
            key={rec.item.id}
            style={styles.sessionCard}
            onPress={() => openPlayer({ item: rec.item })}
          >
            <View style={styles.sessionIconBox}>
              <Text style={styles.sessionEmoji}>
                {rec.item.type === 'breathing' ? '🫁' : rec.item.type === 'soundscape' ? '🌲' : '🎧'}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitleText} numberOfLines={1}>
                {rec.item.title}
              </Text>
              <Text style={styles.sessionSubtitleText} numberOfLines={1}>
                {rec.reasons[0] || 'Recomendado para o seu momento'}
              </Text>
            </View>
            <View style={styles.sessionRight}>
              {rec.item.duration_seconds ? (
                <Text style={styles.sessionDurationText}>
                  {Math.round(rec.item.duration_seconds / 60)} min
                </Text>
              ) : null}
              <Text style={styles.sessionChevron}>›</Text>
            </View>
          </Pressable>
        ))}

        {!loading && recs.length === 0 ? (
          <Text style={styles.empty}>
            Sem recomendações ainda — verifique se o backend está no ar.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.marginMobile,
    paddingTop: spacing.gutter + 32,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  welcomeSection: {
    gap: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  welcomeTitle: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  heroCard: {
    borderRadius: rounded.xl,
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    height: 220,
    backgroundColor: colors.surfaceContainerLow,
  },
  heroBg: {
    flex: 1,
  },
  heroBgImage: {
    opacity: 0.8,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 38, 0.55)',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTag: {
    backgroundColor: glass.background,
    borderColor: glass.borderColor,
    borderWidth: glass.borderWidth,
    borderRadius: rounded.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroTagText: {
    ...typography.labelSm,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  breathCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(211, 187, 255, 0.45)',
  },
  heroFooter: {
    gap: spacing.xs,
  },
  heroTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  heroDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  playButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 4,
    gap: spacing.xs + 2,
  },
  playButtonIcon: {
    color: colors.primary,
    fontSize: 10,
  },
  playButtonText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  heroDuration: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  heroFallback: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bentoCard: {
    backgroundColor: glass.background,
    borderColor: glass.borderColor,
    borderWidth: glass.borderWidth,
    borderRadius: rounded.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 4,
    flexGrow: 1,
    minWidth: '45%',
  },
  bentoIconBg: {
    width: 44,
    height: 44,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoEmoji: {
    fontSize: 20,
  },
  bentoText: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  sessionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  seeAllText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  sessionList: {
    gap: spacing.xs + 4,
  },
  sessionCard: {
    backgroundColor: glass.background,
    borderColor: glass.borderColor,
    borderWidth: glass.borderWidth,
    borderRadius: rounded.lg + 2,
    padding: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  sessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: rounded.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionEmoji: {
    fontSize: 20,
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionTitleText: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  sessionSubtitleText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionDurationText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  sessionChevron: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 22,
  },
  empty: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
