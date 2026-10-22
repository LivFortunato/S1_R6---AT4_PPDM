import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Artwork } from './Artwork';
import { colors } from '../theme';

export function MiniPlayer({
  track,
  isPlaying,
  position,
  duration,
  onTogglePlay,
  onNext,
  onOpen,
}) {
  const visible = Boolean(track);
  const slide = useRef(new Animated.Value(visible ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 120] }) },
          ],
          opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Barrinha fininha de progresso no topo (igual ao Spotify) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Pressable style={styles.content} onPress={onOpen}>
        <Artwork track={track} size={44} radius={4} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>
            {track?.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {track?.artist}
          </Text>
        </View>
      </Pressable>

      <View style={styles.controls}>
        <Pressable
          onPress={onTogglePlay}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={30}
            color={colors.text}
          />
        </Pressable>
        <Pressable onPress={onNext} hitSlop={10} style={styles.iconButton} accessibilityLabel="Próxima">
          <MaterialCommunityIcons name="skip-next" size={30} color={colors.text} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.divider,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
    gap: 2,
  },
  iconButton: {
    padding: 6,
  },
});