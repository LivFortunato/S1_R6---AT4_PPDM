import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Artwork, PlayingBars } from './Artwork';
import { colors } from '../theme';
import { formatTime } from '../utils/formatTime';

export function TrackRow({ track, index, isCurrent, isPlaying, onPress }) {
  const isActive = isCurrent && isPlaying;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {/* Coluna da capa (ou das barrinhas verdes, quando é a que está tocando) */}
      <View style={styles.artBox}>
        {isCurrent ? (
          <PlayingBars playing={isPlaying} />
        ) : (
          <Artwork track={track} size={48} radius={4} />
        )}
      </View>

      {/* Nome da música + artista */}
      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.title, isCurrent && styles.titleActive]}
        >
          {track.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {track.artist}
          {track.album ? ` · ${track.album}` : ''}
        </Text>
      </View>

      {/* Duração (só aparece se você preencher "duration" no playlist.js) */}
      {track.duration ? (
        <Text style={styles.duration}>{formatTime(track.duration)}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: colors.divider,
  },
  artBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  titleActive: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 8,
    fontVariant: ['tabular-nums'],
  },
});