import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { api, ContentItem } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, rounded, typography } from '../theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function ProfileScreen() {
  const { email, token, logout, userRole } = useApp();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for CMS
  const [showCMSForm, setShowCMSForm] = useState(false);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsCategory, setCmsCategory] = useState('Meditação');
  const [cmsDuration, setCmsDuration] = useState('10');
  const [cmsImageUrl, setCmsImageUrl] = useState('');
  const [cmsAudioUrl, setCmsAudioUrl] = useState('');
  const [cmsIsLicensed, setCmsIsLicensed] = useState(true);
  const [cmsLicenseCode, setCmsLicenseCode] = useState('');

  const [cmsEixoEspiritual, setCmsEixoEspiritual] = useState('Mindfulness');
  const [cmsIdealMood, setCmsIdealMood] = useState('Sem Foco');
  const [cmsTimeOfDay, setCmsTimeOfDay] = useState('Morning');
  const [cmsObjective, setCmsObjective] = useState('Relaxar');

  const loadData = async () => {
    setLoading(true);
    try {
      const hist = await api<any[]>('/history', { token }).catch(() => []);
      setHistoryList(hist);
      const items = await api<ContentItem[]>('/catalog').catch(() => []);
      setCatalogItems(items);
    } catch (e) {
      console.log('Error loading profile data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const toggleCMSForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCMSForm(!showCMSForm);
  };

  const handleAddSession = async () => {
    if (!cmsTitle.trim()) {
      alert('Por favor, informe o título da sessão.');
      return;
    }

    const typeMap: Record<string, string> = {
      'Meditação': 'meditation',
      'Natureza': 'soundscape',
      'Binaural': 'binaural',
      'Respiração': 'breathing',
    };

    const newSession = {
      title: cmsTitle.trim(),
      description: `Sessão cadastrada via CMS em ${new Date().toLocaleDateString()}`,
      type: typeMap[cmsCategory] || 'meditation',
      duration_seconds: (parseInt(cmsDuration) || 10) * 60,
      is_premium: cmsIsLicensed,
      cover_image_url: cmsImageUrl.trim() || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop',
      audio_url: cmsAudioUrl.trim() || 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
      spiritual_axis: [cmsEixoEspiritual.trim()],
      mood_tags: [cmsIdealMood.trim()],
      time_of_day: cmsTimeOfDay.trim(),
      objective: cmsObjective.trim(),
    };

    try {
      // Post to backend database
      await api('/catalog', {
        method: 'POST',
        body: newSession,
        token,
      });

      alert('Sessão cadastrada com sucesso!');
      
      // Clear inputs
      setCmsTitle('');
      setCmsImageUrl('');
      setCmsAudioUrl('');
      setCmsLicenseCode('');
      setShowCMSForm(false);
      
      // Reload items
      loadData();
    } catch (e) {
      alert('Falha ao salvar a sessão no SQLite do backend. Usando simulação local.');
      // Simulação local para propósitos de teste caso backend não suporte POST direto na API pública
      const tempId = `sim_${Date.now()}`;
      const simulatedItem: ContentItem = {
        id: tempId,
        title: newSession.title,
        description: newSession.description,
        type: newSession.type,
        spiritual_axis: newSession.spiritual_axis,
        mood_tags: newSession.mood_tags,
        duration_seconds: newSession.duration_seconds,
        is_premium: newSession.is_premium,
        cover_image: {
          id: `cover_${tempId}`,
          title: newSession.title,
          url: newSession.cover_image_url,
          colors: ['#DDE6D5'],
          visual_tags: ['cms'],
          spiritual_axis: newSession.spiritual_axis,
          attribution: null,
        },
        audio: [
          {
            id: `audio_${tempId}`,
            url: newSession.audio_url,
            format: 'wav',
            is_loopable: true,
          },
        ],
        binaural: null,
        attributions: [],
      };
      setCatalogItems((prev) => [simulatedItem, ...prev]);
      setShowCMSForm(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api(`/catalog/${id}`, {
        method: 'DELETE',
        token,
      });
      alert('Sessão deletada.');
      loadData();
    } catch (e) {
      // Simulação local
      setCatalogItems((prev) => prev.filter((item) => item.id !== id));
      alert('Removido localmente.');
    }
  };

  const userName = email ? email.split('@')[0] : 'Gabriel';
  const displayEmail = email || 'gabriel@aurasync.com';
  const initials = userName.slice(0, 2).toUpperCase();

  // Stats computation
  const totalSessions = historyList.length;
  // Fallback to average of 10 minutes per session if duration isn't present
  const totalMins = Math.round(
    historyList.reduce((acc, h) => acc + (h.duration_seconds || 600), 0) / 60
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Seu Perfil AuraSync</Text>
      <Text style={styles.subtitle}>Estatísticas em tempo real do monorepo</Text>

      {/* Profile Detail Card */}
      <View style={styles.profileCard}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.userName}>{capitalize(userName)}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{userRole.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.userToken} numberOfLines={1}>
              Token JWT: {token ? `${token.slice(0, 22)}...` : 'Nenhum token'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* User stats */}
        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Total Meditado</Text>
            <Text style={styles.statVal}>{totalMins} min</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Sessões Totais</Text>
            <Text style={styles.statVal}>{totalSessions} vezes</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Streak Semanal</Text>
            <Text style={[styles.statVal, styles.statValGreen]}>3 dias</Text>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Deslogar / Invalidar Tokens JWT</Text>
        </Pressable>
      </View>

      {/* Layer 3: Admin CMS Curator (CRUD) */}
      {userRole === 'admin' && (
        <View style={styles.cmsContainer}>
          <Pressable style={styles.cmsHeader} onPress={toggleCMSForm}>
            <View style={styles.cmsHeaderLeft}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#141E0D" />
              <View style={styles.cmsHeaderTextContainer}>
                <Text style={styles.cmsHeaderTitle}>AuraSync Admin CMS Curadoria</Text>
                <Text style={styles.cmsHeaderSubtitle}>Cadastrar novas sessões no banco de dados</Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={showCMSForm ? 'close' : 'plus'}
              size={22}
              color="#141E0D"
            />
          </Pressable>

          {showCMSForm && (
            <View style={styles.cmsForm}>
              <Text style={styles.cmsFormHeading}>ADICIONAR NOVA SESSÃO</Text>

              <Text style={styles.inputLabel}>Título da Sessão</Text>
              <TextInput
                style={styles.cmsInput}
                value={cmsTitle}
                onChangeText={setCmsTitle}
                placeholder="Título da sessão..."
                placeholderTextColor="#797869"
                testID="cms_title_input"
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Categoria</Text>
                  <TextInput
                    style={styles.cmsInput}
                    value={cmsCategory}
                    onChangeText={setCmsCategory}
                    placeholder="Ex: Meditação"
                    placeholderTextColor="#797869"
                    testID="cms_category_input"
                  />
                </View>
                <View style={{ width: 80, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Minutos</Text>
                  <TextInput
                    style={styles.cmsInput}
                    value={cmsDuration}
                    onChangeText={setCmsDuration}
                    placeholder="10"
                    placeholderTextColor="#797869"
                    keyboardType="numeric"
                    testID="cms_duration_input"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>URL da Imagem de Fundo</Text>
              <TextInput
                style={styles.cmsInput}
                value={cmsImageUrl}
                onChangeText={setCmsImageUrl}
                placeholder="URL da imagem..."
                placeholderTextColor="#797869"
                testID="cms_image_input"
              />

              <Text style={styles.inputLabel}>URL do Áudio Loop (Direct URL)</Text>
              <TextInput
                style={styles.cmsInput}
                value={cmsAudioUrl}
                onChangeText={setCmsAudioUrl}
                placeholder="URL do áudio..."
                placeholderTextColor="#797869"
                testID="cms_audio_input"
              />

              <Pressable
                style={styles.cmsCheckboxRow}
                onPress={() => setCmsIsLicensed(!cmsIsLicensed)}
              >
                <View style={[styles.checkbox, cmsIsLicensed && styles.checkboxChecked]}>
                  {cmsIsLicensed && (
                    <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.checkboxTitle}>Registrar Licença Obrigatória</Text>
                  <Text style={styles.checkboxSubtitle}>
                    Conteúdo liberado para os usuários instantaneamente
                  </Text>
                </View>
              </Pressable>

              {cmsIsLicensed && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.inputLabel}>Chave de Licenciamento</Text>
                  <TextInput
                    style={styles.cmsInput}
                    value={cmsLicenseCode}
                    onChangeText={setCmsLicenseCode}
                    placeholder="Ex: AURA-999"
                    placeholderTextColor="#797869"
                    testID="cms_license_code_input"
                  />
                </View>
              )}

              <View style={styles.divider} />
              <Text style={styles.cmsFormHeading}>PARÂMETROS DE SCORING CONTEXTUAL</Text>

              <Text style={styles.inputLabel}>Eixo Espiritual</Text>
              <TextInput
                style={styles.cmsInput}
                value={cmsEixoEspiritual}
                onChangeText={setCmsEixoEspiritual}
                placeholder="Mindfulness, Alinhamento, etc..."
                placeholderTextColor="#797869"
              />

              <Text style={styles.inputLabel}>Mood Ideal</Text>
              <TextInput
                style={styles.cmsInput}
                value={cmsIdealMood}
                onChangeText={setCmsIdealMood}
                placeholder="Sem Foco, Ansioso, etc..."
                placeholderTextColor="#797869"
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Horário</Text>
                  <TextInput
                    style={styles.cmsInput}
                    value={cmsTimeOfDay}
                    onChangeText={setCmsTimeOfDay}
                    placeholder="Morning, Afternoon, All..."
                    placeholderTextColor="#797869"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Objetivo</Text>
                  <TextInput
                    style={styles.cmsInput}
                    value={cmsObjective}
                    onChangeText={setCmsObjective}
                    placeholder="Relaxar, Focar..."
                    placeholderTextColor="#797869"
                  />
                </View>
              </View>

              <Pressable
                style={styles.saveBtn}
                onPress={handleAddSession}
                testID="cms_save_btn"
              >
                <Text style={styles.saveBtnText}>Persistir Sessão no SQLite</Text>
              </Pressable>
            </View>
          )}

          {/* Manage items list */}
          <Text style={styles.manageListHeading}>GERENCIAR TRILHAS CADASTRADAS</Text>
          <View style={styles.manageItemsList}>
            {catalogItems.map((item) => (
              <View key={item.id} style={styles.manageRow}>
                <View>
                  <View style={styles.manageRowTitleContainer}>
                    <Text style={styles.manageRowTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.licenseBadge,
                        item.is_premium ? styles.licenseBadgeBlocked : styles.licenseBadgeFree,
                      ]}
                    >
                      <Text
                        style={[
                          styles.licenseBadgeText,
                          item.is_premium ? styles.licenseBadgeTextBlocked : styles.licenseBadgeTextFree,
                        ]}
                      >
                        {item.is_premium ? 'BLOQUEADO' : 'LICENCIADO'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.manageRowSub}>
                    Eixo: {item.spiritual_axis?.[0] || 'Geral'} • Mood: {item.mood_tags?.[0] || 'Todos'}
                  </Text>
                </View>

                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteSession(item.id)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 80,
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
    marginBottom: 16,
    fontFamily: typography.bodyMd.fontFamily,
  },
  profileCard: {
    backgroundColor: 'rgba(230, 225, 212, 0.95)',
    borderWidth: 0.5,
    borderColor: '#A8B59E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#141E0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.headlineMd.fontFamily,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  roleBadge: {
    backgroundColor: 'rgba(208, 144, 47, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#D0902F',
    fontFamily: typography.labelSm.fontFamily,
  },
  userToken: {
    fontSize: 10,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(168, 181, 158, 0.2)',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1C16',
    marginTop: 2,
    fontFamily: typography.labelMd.fontFamily,
  },
  statValGreen: {
    color: '#2C5E3B',
  },
  logoutBtn: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: typography.labelSm.fontFamily,
  },

  // CMS Styles
  cmsContainer: {
    width: '100%',
  },
  cmsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DDE6D5',
    borderWidth: 1,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    borderRadius: 14,
    padding: 14,
  },
  cmsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cmsHeaderTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  cmsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.labelMd.fontFamily,
  },
  cmsHeaderSubtitle: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  cmsForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  cmsFormHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D0902F',
    letterSpacing: 1.2,
    marginBottom: 12,
    fontFamily: typography.labelSm.fontFamily,
  },
  inputLabel: {
    fontSize: 12,
    color: '#797869',
    marginBottom: 4,
    fontFamily: typography.labelSm.fontFamily,
  },
  cmsInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1D1C16',
    marginBottom: 10,
    fontFamily: typography.bodyMd.fontFamily,
  },
  formRow: {
    flexDirection: 'row',
  },
  cmsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#797869',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#D0902F',
    borderColor: '#D0902F',
  },
  checkboxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelSm.fontFamily,
  },
  checkboxSubtitle: {
    fontSize: 11,
    color: '#797869',
    fontFamily: typography.bodyMd.fontFamily,
  },
  saveBtn: {
    height: 48,
    backgroundColor: '#141E0D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.labelMd.fontFamily,
  },

  // Manage items list styles
  manageListHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797869',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: typography.labelMd.fontFamily,
  },
  manageItemsList: {
    gap: 8,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.2)',
    borderRadius: 12,
    padding: 10,
  },
  manageRowTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manageRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  manageRowSub: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  licenseBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  licenseBadgeFree: {
    backgroundColor: 'rgba(125, 160, 131, 0.15)',
  },
  licenseBadgeBlocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  licenseBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    fontFamily: typography.labelSm.fontFamily,
  },
  licenseBadgeTextFree: {
    color: '#2C5E3B',
  },
  licenseBadgeTextBlocked: {
    color: '#EF4444',
  },
  deleteBtn: {
    padding: 6,
  },
});
