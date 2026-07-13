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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { api, coverUrl, Recommendation } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, rounded, spacing, typography } from '../theme';

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

  // Pulse animation for recommended hero card indicator
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

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

  const userName = email ? capitalize(email.split('@')[0]) : 'Gabriel';
  const heroItem = recs[0]?.item;
  // Short sessions defined as duration <= 8 minutes (480 seconds)
  const shortSessions = recs.filter((rec) => {
    const secs = rec.item.duration_seconds || 0;
    return secs > 0 && secs <= 480;
  });

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
          tintColor="#7DA083"
        />
      }
    >
      {/* 1. Custom Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="spa" size={32} color="#7DA083" />
          <Text style={styles.headerTitle}>AuraSync</Text>
        </View>
        <Pressable style={styles.notificationBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#141E0D" />
        </Pressable>
      </View>

      {/* 2. Greetings */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeSubtitle}>
          {greeting()}, {userName}
        </Text>
        <Text style={styles.welcomeTitle}>Encontre sua paz interior hoje</Text>
      </View>

      {/* 3. Recommended Hero Card */}
      {heroItem ? (
        <Pressable
          style={styles.heroCard}
          onPress={() => openPlayer({ item: heroItem })}
          testID="recommended_hero_card"
        >
          <ImageBackground
            source={{ uri: coverUrl(heroItem) }}
            style={styles.heroBg}
            imageStyle={styles.heroBgImage}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroHeader}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>RECOMENDADO AGORA</Text>
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
                <Text style={styles.heroDesc} numberOfLines={2}>
                  {heroItem.description ||
                    'Uma jornada profunda para alinhar sua energia e focar sua mente.'}
                </Text>

                <View style={styles.heroActions}>
                  <View style={styles.playButton}>
                    <MaterialCommunityIcons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.playButtonText}>Começar Agora</Text>
                  </View>
                  {heroItem.duration_seconds ? (
                    <View style={styles.durationContainer}>
                      <MaterialCommunityIcons
                        name="timer-outline"
                        size={14}
                        color="rgba(255, 255, 255, 0.8)"
                      />
                      <Text style={styles.heroDuration}>
                        {Math.round(heroItem.duration_seconds / 60)} min
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      ) : null}

      {/* 4. Quick Access Bento Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ACESSOS RÁPIDOS</Text>
      </View>
      <View style={styles.bentoGrid}>
        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Explorar', { category: 'soundscape' })}
        >
          <MaterialCommunityIcons name="tree" size={24} color="#7DA083" />
          <Text style={styles.bentoText}>Sons da Natureza</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Explorar', { category: 'binaural' })}
        >
          <MaterialCommunityIcons name="waveform" size={24} color="#7DA083" />
          <Text style={styles.bentoText}>Ondas Binaurais</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Meditar')}
        >
          <MaterialCommunityIcons name={"weather-windy" as any} size={24} color="#7DA083" />
          <Text style={styles.bentoText}>Exercício Respirar</Text>
        </Pressable>

        <Pressable
          style={styles.bentoCard}
          onPress={() => navigation.navigate('Explorar', { category: 'meditation' })}
        >
          <MaterialCommunityIcons name={"spa" as any} size={24} color="#7DA083" />
          <Text style={styles.bentoText}>Meditação Zen</Text>
        </Pressable>
      </View>

      {/* 5. Recent Short Sessions */}
      <View style={styles.sessionHeaderContainer}>
        <Text style={styles.sectionTitle}>SESSÕES CURTAS</Text>
        <Pressable onPress={() => navigation.navigate('Explorar')}>
          <Text style={styles.seeAllText}>Ver todas</Text>
        </Pressable>
      </View>

      <View style={styles.sessionList}>
        {shortSessions.length > 0 ? (
          shortSessions.map((rec) => (
            <Pressable
              key={rec.item.id}
              style={styles.sessionCard}
              onPress={() => openPlayer({ item: rec.item })}
            >
              <View style={styles.sessionIconBox}>
                <MaterialCommunityIcons
                  name={
                    (rec.item.type === 'breathing'
                      ? 'weather-windy'
                      : rec.item.type === 'soundscape'
                      ? 'tree'
                      : rec.item.type === 'binaural'
                      ? 'waveform'
                      : rec.item.type === 'music'
                      ? 'music'
                      : 'spa') as any
                  }
                  size={18}
                  color="#141E0D"
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitleText} numberOfLines={1}>
                  {rec.item.title}
                </Text>
                <Text style={styles.sessionSubtitleText} numberOfLines={1}>
                  {rec.item.type === 'soundscape'
                    ? 'Natureza'
                    : rec.item.type === 'binaural'
                    ? 'Binaural'
                    : rec.item.type === 'breathing'
                    ? 'Respiração'
                    : rec.item.type === 'music'
                    ? 'Música'
                    : 'Meditação'}{' '}
                  • Eixo: {rec.item.spiritual_axis?.[0] || 'Geral'}
                </Text>
              </View>
              <View style={styles.sessionRight}>
                {rec.item.duration_seconds ? (
                  <Text style={styles.sessionDurationText}>
                    {Math.round(rec.item.duration_seconds / 60)} min
                  </Text>
                ) : null}
                <MaterialCommunityIcons name="chevron-right" size={16} color="#7DA083" />
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={styles.empty}>Nenhuma sessão curta encontrada.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1', // Light warm cream background
  },
  content: {
    padding: 16,
    paddingTop: 12,
    gap: 16,
    paddingBottom: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.headlineMd.fontFamily,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDE6D5',
    borderWidth: 0.5,
    borderColor: '#A8B59E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    gap: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#797869',
    fontWeight: '500',
    fontFamily: typography.labelMd.fontFamily,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.headlineMd.fontFamily,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#E6E3D1',
  },
  heroBg: {
    flex: 1,
  },
  heroBgImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 30, 13, 0.45)', // Greenish dark overlay
    padding: 16,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTag: {
    backgroundColor: '#DDE6D5',
    borderWidth: 0.5,
    borderColor: '#A8B59E',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.labelSm.fontFamily,
  },
  breathCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(125, 160, 131, 0.5)',
    borderWidth: 1,
    borderColor: '#141E0D',
  },
  heroFooter: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.headlineMd.fontFamily,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: typography.bodyMd.fontFamily,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  playButton: {
    backgroundColor: '#141E0D',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
  },
  playButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: typography.labelSm.fontFamily,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroDuration: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: typography.bodyMd.fontFamily,
  },
  heroFallback: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#E6E3D1',
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797869',
    letterSpacing: 1.5,
    fontFamily: typography.labelMd.fontFamily,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bentoCard: {
    width: '48%',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bentoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
  },
  sessionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 11,
    color: '#7DA083',
    fontFamily: typography.labelSm.fontFamily,
  },
  sessionList: {
    gap: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 16,
    padding: 12,
  },
  sessionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DDE6D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  sessionSubtitleText: {
    fontSize: 11,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionDurationText: {
    fontSize: 11,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  empty: {
    fontSize: 12,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
    paddingVertical: 12,
  },
});
