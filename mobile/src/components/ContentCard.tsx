import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ContentItem, coverUrl } from '../api/client';
import { AXIS_LABELS, colors, TYPE_LABELS } from '../theme';

export function ContentCard({
  item,
  subtitle,
  onPress,
}: {
  item: ContentItem;
  subtitle?: string;
  onPress: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = coverUrl(item);
  const showFallback = !url || imgFailed;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {showFallback ? (
        <View style={[styles.cover, styles.coverFallback]}>
          <Text style={styles.coverEmoji}>
            {item.type === 'breathing' ? '🫁' : '🎧'}
          </Text>
        </View>
      ) : (
        <Image source={{ uri: url }} style={styles.cover} onError={() => setImgFailed(true)} />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {TYPE_LABELS[item.type] ?? item.type}
          {item.spiritual_axis.length
            ? ` · ${item.spiritual_axis.map((a) => AXIS_LABELS[a] ?? a).join(', ')}`
            : ''}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cover: { width: 88, height: 88 },
  coverFallback: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: { fontSize: 30 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  meta: { color: colors.primary, fontSize: 12, marginTop: 2 },
  subtitle: { color: colors.textDim, fontSize: 12, marginTop: 4 },
});
