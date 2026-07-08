import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api, ContentItem, ImageAsset, mediaUrl } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const SECTIONS = [
  { key: 'music', label: 'Músicas' },
  { key: 'soundscape', label: 'Natureza' },
  { key: 'binaural', label: 'Binaural' },
  { key: 'images', label: 'Imagens' },
] as const;

export function ExploreScreen() {
  const { openPlayer } = useApp();
  const [section, setSection] = useState<string>('binaural');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (section === 'images') {
          setImages(await api<ImageAsset[]>('/images'));
        } else {
          setItems(await api<ContentItem[]>(`/catalog?type=${section}`));
        }
      } catch {
        setItems([]);
        setImages([]);
      }
    })();
  }, [section]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <View style={styles.chips}>
        {SECTIONS.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.chip, section === s.key && styles.chipActive]}
            onPress={() => setSection(s.key)}
          >
            <Text style={[styles.chipText, section === s.key && styles.chipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {section === 'images' ? (
          <View style={styles.grid}>
            {images.map((img) => (
              <View key={img.id} style={styles.gridItem}>
                <Image source={{ uri: mediaUrl(img.url) }} style={styles.gridImage} />
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {img.title}
                </Text>
              </View>
            ))}
          </View>
        ) : items.length > 0 ? (
          items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              subtitle={item.description ?? undefined}
              onPress={() => openPlayer({ item })}
            />
          ))
        ) : (
          <Text style={styles.empty}>
            Nenhum conteúdo nesta seção ainda. A curadoria de acervo externo
            (Musopen, Freesound, Wikimedia) entra na próxima fase.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textDim, fontSize: 13 },
  chipTextActive: { color: colors.background, fontWeight: '700' },
  list: { padding: 20, paddingTop: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
  gridImage: { width: '100%', aspectRatio: 1.5, borderRadius: 12 },
  gridTitle: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  empty: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
});
