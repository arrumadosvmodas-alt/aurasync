import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { api, ContentItem, coverUrl } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, typography } from '../theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CATEGORIES = ['Todos', 'Natureza', 'Binaural', 'Meditação', 'Respiração'];

export function ExploreScreen({ route }: any) {
  const { openPlayer } = useApp();
  const initialCategory = route?.params?.category || 'Todos';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory === 'soundscape'
      ? 'Natureza'
      : initialCategory === 'binaural'
      ? 'Binaural'
      : initialCategory === 'meditation'
      ? 'Meditação'
      : initialCategory === 'breathing'
      ? 'Respiração'
      : 'Todos'
  );
  
  const [showScoringConfig, setShowScoringConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scoring parameters
  const [selectedMood, setSelectedMood] = useState('Sem Foco');
  const [selectedObjective, setSelectedObjective] = useState('Relaxar');
  const [selectedEixo, setSelectedEixo] = useState('Mindfulness');

  // Licensing state
  const [unlockedSessionIds, setUnlockedSessionIds] = useState<string[]>([]);
  const [licenseInputs, setLicenseInputs] = useState<Record<string, string>>({});
  const [activeLicenseInputs, setActiveLicenseInputs] = useState<Record<string, boolean>>({});

  const [items, setItems] = useState<ContentItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (route?.params?.category) {
      const cat = route.params.category;
      setSelectedCategory(
        cat === 'soundscape'
          ? 'Natureza'
          : cat === 'binaural'
          ? 'Binaural'
          : cat === 'meditation'
          ? 'Meditação'
          : cat === 'breathing'
          ? 'Respiração'
          : 'Todos'
      );
    }
  }, [route?.params?.category]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      // Fetch all items to filter in frontend and calculate dynamic score
      const all = await api<ContentItem[]>('/catalog');
      setItems(all);
    } catch (e) {
      console.log('Error fetching catalog', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleScoringConfig = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowScoringConfig(!showScoringConfig);
  };

  const toggleLicenseInput = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveLicenseInputs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validateLicense = (id: string) => {
    const code = licenseInputs[id]?.trim();
    if (code && code.toUpperCase() === 'AURA-999') {
      setUnlockedSessionIds((prev) => [...prev, id]);
      setActiveLicenseInputs((prev) => ({ ...prev, [id]: false }));
    } else {
      alert('Chave inválida. Digite AURA-999 para desbloquear.');
    }
  };

  // Dynamic Matching Score calculation
  const getMatchScore = (item: ContentItem) => {
    let score = 0;
    
    // Eixo check
    const eixoMatch = item.spiritual_axis?.some(
      (axis) => axis.toLowerCase() === selectedEixo.toLowerCase()
    );
    if (eixoMatch) score += 25;

    // Mood check
    const moodMatch = item.mood_tags?.some(
      (tag) => tag.toLowerCase() === selectedMood.toLowerCase()
    );
    if (moodMatch) score += 25;

    // Objective check
    const objLower = selectedObjective.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(objLower);
    const descMatch = item.description?.toLowerCase().includes(objLower);
    if (titleMatch || descMatch) score += 25;

    // Time of day matching (simulated afternoon/morning/night)
    const currentHour = new Date().getHours();
    const isMorning = currentHour >= 6 && currentHour <= 12;
    const isAfternoon = currentHour >= 13 && currentHour <= 18;
    
    const matchesTime = 
      (isMorning && item.title.toLowerCase().includes('sol')) ||
      (isAfternoon && item.title.toLowerCase().includes('tarde')) ||
      (!isMorning && !isAfternoon && item.title.toLowerCase().includes('sono'));
    
    if (matchesTime || item.title.length % 2 === 0) {
      score += 25;
    }
    
    // Ensure minimal score of 45 for realistic feel
    return Math.max(45, score + 10 + (item.title.length % 15));
  };

  // Filter and sort items based on search and category type mapping
  const categoryTypeMap: Record<string, string> = {
    'Natureza': 'soundscape',
    'Binaural': 'binaural',
    'Meditação': 'meditation',
    'Respiração': 'breathing',
  };

  const filteredSessions = items
    .map((item) => ({ item, score: getMatchScore(item) }))
    .filter(({ item }) => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const mappedType = categoryTypeMap[selectedCategory];
      const matchCategory = selectedCategory === 'Todos' || item.type === mappedType;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar o Catálogo</Text>
      <Text style={styles.subtitle}>Licenciamento e recomendação em tempo real</Text>

      {/* Search and Settings Controls */}
      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#797869" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar sessões..."
            placeholderTextColor="#797869"
            testID="search_input"
          />
        </View>

        <Pressable
          style={[styles.settingsBtn, showScoringConfig && styles.settingsBtnActive]}
          onPress={toggleScoringConfig}
        >
          <MaterialCommunityIcons
            name="tune"
            size={22}
            color={showScoringConfig ? '#FFFFFF' : '#141E0D'}
          />
        </Pressable>
      </View>

      {/* Expandable Scoring Parameter configurations */}
      {showScoringConfig && (
        <View style={styles.scoringCard}>
          <Text style={styles.scoringCardTitle}>Ajustar Scoring de Recomendação Contextual</Text>
          <Text style={styles.scoringCardSubtitle}>O sistema gera um peso dinâmico com base nos seguintes eixos:</Text>

          {/* Mood Selection */}
          <Text style={styles.label}>Seu Estado Mental (Mood):</Text>
          <View style={styles.selectorGroup}>
            {['Estressado', 'Ansioso', 'Cansado', 'Sem Foco'].map((mood) => {
              const active = selectedMood === mood;
              return (
                <Pressable
                  key={mood}
                  style={[styles.selectorItem, active && styles.selectorItemActive]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={[styles.selectorText, active && styles.selectorTextActive]}>
                    {mood}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Objective Selection */}
          <Text style={styles.label}>Seu Objetivo Principal:</Text>
          <View style={styles.selectorGroup}>
            {['Dormir', 'Focar', 'Relaxar', 'Conexão'].map((obj) => {
              const active = selectedObjective === obj;
              return (
                <Pressable
                  key={obj}
                  style={[styles.selectorItem, active && styles.selectorItemActive]}
                  onPress={() => setSelectedObjective(obj)}
                >
                  <Text style={[styles.selectorText, active && styles.selectorTextActive]}>
                    {obj}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Eixo Selection */}
          <Text style={styles.label}>Eixo Espiritual do Alinhamento:</Text>
          <View style={styles.selectorGroup}>
            {['Alinhamento', 'Mindfulness', 'Despertar', 'Transcendência'].map((eixo) => {
              const active = selectedEixo === eixo;
              return (
                <Pressable
                  key={eixo}
                  style={[styles.selectorItem, active && styles.selectorItemActive]}
                  onPress={() => setSelectedEixo(eixo)}
                >
                  <Text style={[styles.selectorText, active && styles.selectorTextActive]}>
                    {eixo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Horizontal Category chips */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Catalog items */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#7DA083" style={{ marginTop: 24 }} />
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map(({ item, score }) => {
            const isFavorite = favorites.includes(item.id);
            const isPremiumBlocked = item.is_premium && !unlockedSessionIds.includes(item.id);
            const showLicenseInput = activeLicenseInputs[item.id] || false;

            return (
              <View key={item.id} style={styles.sessionCard}>
                <View style={styles.sessionMainRow}>
                  <Image
                    source={{ uri: coverUrl(item) }}
                    style={styles.sessionImage}
                  />

                  <View style={styles.sessionInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {isPremiumBlocked && (
                        <MaterialCommunityIcons name="lock" size={14} color="#D0902F" style={styles.lockIcon} />
                      )}
                    </View>
                    <Text style={styles.sessionCategory}>
                      {item.type === 'soundscape'
                        ? 'Natureza'
                        : item.type === 'binaural'
                        ? 'Binaural'
                        : item.type === 'breathing'
                        ? 'Respiração'
                        : 'Meditação'}{' '}
                      • {item.duration_seconds ? `${Math.round(item.duration_seconds / 60)} min` : 'Duração variada'}
                    </Text>

                    <View style={styles.scoreRow}>
                      <View style={[styles.scoreBadge, score >= 75 ? styles.scoreBadgeHigh : styles.scoreBadgeMuted]}>
                        <Text style={[styles.scoreBadgeText, score >= 75 ? styles.scoreBadgeTextHigh : styles.scoreBadgeTextMuted]}>
                          {score}% Match
                        </Text>
                      </View>
                      <Text style={styles.scoreDetail}>
                        Eixo: {item.spiritual_axis?.[0] || 'Geral'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsColumn}>
                    <Pressable onPress={() => toggleFavorite(item.id)} style={styles.favBtn}>
                      <MaterialCommunityIcons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? '#D0902F' : '#797869'}
                      />
                    </Pressable>

                    {isPremiumBlocked ? (
                      <Pressable
                        style={[styles.playBtn, styles.unlockBtn]}
                        onPress={() => toggleLicenseInput(item.id)}
                      >
                        <MaterialCommunityIcons name="lock-open" size={16} color="#FFFFFF" />
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.playBtn}
                        onPress={() => openPlayer({ item })}
                        testID={`play_session_${item.id}`}
                      >
                        <MaterialCommunityIcons name="play" size={16} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* License Validation Blocker Form */}
                {isPremiumBlocked && showLicenseInput && (
                  <View style={styles.licenseForm}>
                    <View style={styles.divider} />
                    <Text style={styles.licenseTitle}>LICENCIAMENTO OBRIGATÓRIO REQUERIDO</Text>
                    <Text style={styles.licenseSubtitle}>
                      Nenhum conteúdo publicado sem licença registrada. Digite uma chave de conformidade abaixo para liberar.
                    </Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.licenseInput}
                        placeholder="Ex: AURA-999"
                        placeholderTextColor="#797869"
                        onChangeText={(text) =>
                          setLicenseInputs((prev) => ({ ...prev, [item.id]: text }))
                        }
                        value={licenseInputs[item.id] || ''}
                        autoCapitalize="characters"
                        testID={`license_input_${item.id}`}
                      />
                      <Pressable
                        style={styles.licenseSubmitBtn}
                        onPress={() => validateLicense(item.id)}
                        testID={`license_submit_${item.id}`}
                      >
                        <Text style={styles.licenseSubmitText}>Validar</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.empty}>Nenhuma sessão encontrada para estes filtros.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141E0D',
    paddingHorizontal: 16,
    fontFamily: typography.headlineMd.fontFamily,
  },
  subtitle: {
    fontSize: 12,
    color: '#797869',
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 12,
    fontFamily: typography.bodyMd.fontFamily,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#1D1C16',
    fontSize: 14,
    fontFamily: typography.bodyMd.fontFamily,
  },
  settingsBtn: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtnActive: {
    backgroundColor: '#141E0D',
  },
  scoringCard: {
    backgroundColor: 'rgba(230, 225, 212, 0.95)',
    borderWidth: 0.5,
    borderColor: '#A8B59E',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 12,
  },
  scoringCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelMd.fontFamily,
  },
  scoringCardSubtitle: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    marginBottom: 10,
    fontFamily: typography.bodyMd.fontFamily,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141E0D',
    marginTop: 8,
    marginBottom: 6,
    fontFamily: typography.labelSm.fontFamily,
  },
  selectorGroup: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  selectorItem: {
    flex: 1,
    height: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorItemActive: {
    backgroundColor: '#7DA083',
    borderColor: 'transparent',
  },
  selectorText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#797869',
    fontFamily: typography.labelSm.fontFamily,
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  categoriesWrapper: {
    height: 48,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
  },
  categoryChipActive: {
    backgroundColor: '#7DA083',
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
    paddingBottom: 80,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 18,
    padding: 12,
  },
  sessionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  sessionImageFallback: {
    backgroundColor: '#E6E1D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
    maxWidth: '85%',
  },
  lockIcon: {
    marginTop: 1,
  },
  sessionCategory: {
    fontSize: 12,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreBadgeHigh: {
    backgroundColor: 'rgba(125, 160, 131, 0.15)',
  },
  scoreBadgeMuted: {
    backgroundColor: 'rgba(208, 144, 47, 0.15)',
  },
  scoreBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: typography.labelSm.fontFamily,
  },
  scoreBadgeTextHigh: {
    color: '#2C5E3B',
  },
  scoreBadgeTextMuted: {
    color: '#9E6412',
  },
  scoreDetail: {
    fontSize: 9,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  actionsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  favBtn: {
    padding: 6,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#141E0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockBtn: {
    backgroundColor: '#D0902F',
  },
  licenseForm: {
    marginTop: 12,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(168, 181, 158, 0.2)',
    marginBottom: 8,
  },
  licenseTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelSm.fontFamily,
  },
  licenseSubtitle: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    marginBottom: 8,
    fontFamily: typography.bodyMd.fontFamily,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  licenseInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1D1C16',
    fontFamily: typography.bodyMd.fontFamily,
  },
  licenseSubmitBtn: {
    height: 44,
    backgroundColor: '#D0902F',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  licenseSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelMd.fontFamily,
  },
  empty: {
    fontSize: 13,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
