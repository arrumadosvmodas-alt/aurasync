import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { CompleteCatalog, fetchCompleteCatalog, coverUrl } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, rounded, spacing, typography } from '../theme';

export function CatalogScreen() {
  const { openPlayer } = useApp();
  const [catalog, setCatalog] = useState<CompleteCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCompleteCatalog();
        setCatalog(data);
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7DA083" />
      </View>
    );
  }

  if (!catalog) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Erro ao carregar catálogo</Text>
      </View>
    );
  }

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      waveform: 'waveform',
      spa: 'spa',
      tree: 'tree',
      music: 'music',
      'weather-windy': 'weather-windy',
      image: 'image',
      'playlist-music': 'playlist-music',
    };
    return iconMap[iconName] || 'music';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo Completo</Text>
        <Text style={styles.subtitle}>
          {catalog.summary.total_content_items} conteúdos • {catalog.summary.total_images} imagens
        </Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <StatCard label="Conteúdos" value={catalog.summary.total_content_items} />
        <StatCard label="Imagens" value={catalog.summary.total_images} />
        <StatCard label="Playlists" value={catalog.summary.total_playlists} />
      </View>

      {/* Categories */}
      {Object.entries(catalog.catalog).map(([key, category]) => (
        <CategorySection
          key={key}
          category={category}
          onPress={(item) => openPlayer({ item })}
        />
      ))}

      {/* Images Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="image" size={24} color="#7DA083" />
          <Text style={styles.sectionTitle}>{catalog.images.name}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageList}
        >
          {catalog.images.items.map((img) => (
            <View key={img.id} style={styles.imageCard}>
              <Image
                source={{ uri: img.url || undefined }}
                style={styles.image}
              />
              <Text style={styles.imageTitle} numberOfLines={2}>
                {img.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Playlists Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="playlist-music" size={24} color="#7DA083" />
          <Text style={styles.sectionTitle}>{catalog.playlists.name}</Text>
        </View>
        {catalog.playlists.items.map((playlist) => (
          <Pressable key={playlist.id} style={styles.playlistCard}>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle}>{playlist.title}</Text>
              <Text style={styles.playlistDesc} numberOfLines={1}>
                {playlist.description || 'Sem descrição'}
              </Text>
              <Text style={styles.playlistCount}>{playlist.item_count} itens</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#7DA083" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface CategorySectionProps {
  category: any;
  onPress: (item: any) => void;
}

function CategorySection({ category, onPress }: CategorySectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {category.icon} {category.name}
      </Text>
      <Text style={styles.sectionDesc}>{category.description}</Text>
      <View style={styles.itemsList}>
        {category.items.map((item: any) => (
          <Pressable
            key={item.id}
            style={styles.itemCard}
            onPress={() => onPress(item)}
          >
            <Image
              source={{ uri: coverUrl(item) }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemDuration} numberOfLines={1}>
                {item.duration_seconds ? `${Math.round(item.duration_seconds / 60)} min` : 'Duração variada'}
              </Text>
            </View>
            <MaterialCommunityIcons name="play-circle" size={32} color="#7DA083" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#141E0D',
    fontFamily: typography.headlineMd.fontFamily,
  },
  subtitle: {
    fontSize: 14,
    color: '#797869',
    marginTop: 4,
    fontFamily: typography.bodyMd.fontFamily,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(125, 160, 131, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#7DA083',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7DA083',
    fontFamily: typography.headlineMd.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: '#797869',
    marginTop: 4,
    fontFamily: typography.labelMd.fontFamily,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141E0D',
    fontFamily: typography.labelMd.fontFamily,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#797869',
    marginBottom: 12,
    fontFamily: typography.bodyMd.fontFamily,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.3)',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  itemDuration: {
    fontSize: 12,
    color: '#797869',
    marginTop: 4,
    fontFamily: typography.bodyMd.fontFamily,
  },
  imageList: {
    gap: 12,
  },
  imageCard: {
    width: 100,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageTitle: {
    fontSize: 11,
    color: '#141E0D',
    textAlign: 'center',
    fontFamily: typography.labelSm.fontFamily,
  },
  playlistCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.3)',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  playlistDesc: {
    fontSize: 12,
    color: '#797869',
    marginTop: 4,
    fontFamily: typography.bodyMd.fontFamily,
  },
  playlistCount: {
    fontSize: 11,
    color: '#7DA083',
    marginTop: 4,
    fontWeight: '500',
    fontFamily: typography.labelSm.fontFamily,
  },
  retryButton: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#141E0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: typography.labelMd.fontFamily,
  },
  error: {
    fontSize: 16,
    color: '#D0902F',
    fontFamily: typography.bodyMd.fontFamily,
  },
});
