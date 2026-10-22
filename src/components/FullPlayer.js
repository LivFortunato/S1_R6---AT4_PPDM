import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Artwork } from './Artwork';
import { Slider } from './Slider';
import { colors } from '../theme';
import { formatTime } from '../utils/formatTime';

/**
 * Player completo (tela que abre ao tocar no mini player).
 * Tem capa grande, barra de progresso arrastável, controles e volume.
 */
export function FullPlayer({
  visible,
  onClose,
  track,
  isPlaying,
  isLoading,
  position,
  duration,
  shuffle,
  repeat,
  volume,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onVolume,
}) {
  const { width, height } = useWindowDimensions();
  const artSize = Math.min(width - 96, height * 0.42, 380);

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const [coverFrom, coverTo] = track?.colors ?? [colors.surface, colors.background];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Fundo com um leve gradiente usando as cores da capa da música */}
      <LinearGradient
        colors={[coverTo, colors.background, colors.background]}
        locations={[0, 0.55, 1]}
        style={styles.screen}
      >
        {/* Topo: voltar para a lista + nome da playlist */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.headerButton}>
            <MaterialCommunityIcons name="chevron-down" size={30} color={colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>TOCANDO DA PLAYLIST</Text>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {track?.album ?? 'Minhas músicas'}
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Capa grande */}
        <View style={styles.artBox}>
          <Artwork track={track} size={artSize} radius={8} />
        </View>

        {/* Nome da música e artista */}
        <View style={styles.titleBox}>
          <Text numberOfLines={1} style={styles.title}>
            {track?.title ?? 'Nada tocando'}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {track?.artist ?? 'Escolha uma música na lista'}
          </Text>
        </View>

        {/* Barra de progresso arrastável */}
        <View style={styles.progressBox}>
          <Slider
            value={progress}
            onChange={(ratio) => onSeek(ratio * duration)}
            fillColor={colors.text}
            trackColor={colors.divider}
            height={4}
            knob={12}
          />
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controles principais */}
        <View style={styles.controls}>
          <Pressable
            onPress={onToggleShuffle}
            hitSlop={10}
            style={styles.smallButton}
            accessibilityLabel="Aleatório"
          >
            <MaterialCommunityIcons
              name="shuffle-variant"
              size={24}
              color={shuffle ? colors.primary : colors.textMuted}
            />
          </Pressable>

          <Pressable onPress={onPrevious} hitSlop={10} style={styles.smallButton} accessibilityLabel="Anterior">
            <MaterialCommunityIcons name="skip-previous" size={36} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={onTogglePlay}
            style={styles.playButton}
            accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={38}
              color="#0B0B0B"
            />
            {isLoading ? <View style={styles.loadingDot} /> : null}
          </Pressable>

          <Pressable onPress={onNext} hitSlop={10} style={styles.smallButton} accessibilityLabel="Próxima">
            <MaterialCommunityIcons name="skip-next" size={36} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={onCycleRepeat}
            hitSlop={10}
            style={styles.smallButton}
            accessibilityLabel="Repetir"
          >
            <MaterialCommunityIcons
              name={repeat === 'one' ? 'repeat-once' : 'repeat'}
              size={24}
              color={repeat === 'off' ? colors.textMuted : colors.primary}
            />
          </Pressable>
        </View>

        {/* Volume */}
        <View style={styles.volumeRow}>
          <MaterialCommunityIcons
            name={
              volume === 0 ? 'volume-off' : volume < 0.5 ? 'volume-medium' : 'volume-high'
            }
            size={22}
            color={colors.textMuted}
          />
          <Slider
            style={styles.volumeSlider}
            value={volume}
            onChange={onVolume}
            fillColor={colors.textMuted}
            trackColor={colors.divider}
            height={4}
            knob={10}
          />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    alignItems: 'center',
  },
  headerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 12,
    marginTop: 3,
  },
  artBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  titleBox: {
    marginTop: 28,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  artist: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 6,
  },
  progressBox: {
    marginTop: 22,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  smallButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0B0B0B',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  volumeSlider: {
    flex: 1,
    marginLeft: 12,
  },
});