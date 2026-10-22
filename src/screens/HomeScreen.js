import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FullPlayer } from '../components/FullPlayer';
import { MiniPlayer } from '../components/MiniPlayer';
import { TrackRow } from '../components/TrackRow';
import { usePlayer } from '../hooks/usePlayer';
import { isPlaceholder } from '../utils/audioValidation';
import { colors } from '../theme';

/**
 * Tela principal: o cabeçalho + a lista de músicas.
 * O mini player e o player completo ficam por cima da lista.
 */
export default function HomeScreen() {
  const player = usePlayer();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const handleTrackPress = useCallback(
    (index) => {
      // Clicar na música que já está tocando = pausar/continuar.
      if (player.index === index) player.togglePlay();
      else player.playTrack(index);
    },
    [player]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <TrackRow
        track={item}
        index={index}
        isCurrent={player.index === index}
        isPlaying={player.isPlaying}
        onPress={() => handleTrackPress(index)}
      />
    ),
    [handleTrackPress, player.index, player.isPlaying]
  );

  const total = player.playlist.length;
  const allPlaceholders = total > 0 && player.playlist.every(isPlaceholder);

  return (
    <View style={styles.root}>

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>PLAYLIST</Text>
          <Text style={styles.title}>Minhas Músicas</Text>
          <Text style={styles.subtitle}>
            {total} {total === 1 ? 'música' : 'músicas'}
          </Text>
        </View>

        {/* Botão de modo aleatório (liga/desliga o embaralhamento) */}
        <Pressable
          onPress={player.toggleShuffle}
          style={[styles.shuffleButton, player.shuffle && styles.shuffleButtonOn]}
          accessibilityLabel="Modo aleatório"
        >
          <MaterialCommunityIcons
            name="shuffle-variant"
            size={20}
            color={player.shuffle ? '#0B0B0B' : colors.text}
          />
        </Pressable>
      </View>

      {/* Aviso: os .mp3 ainda são de exemplo (mudos) */}
      {allPlaceholders && (
        <View style={styles.warning}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.warningText}>
            Estes <Text style={styles.warningCode}>.mp3</Text> são mudos de exemplo.
            Coloque os seus em assets/audio/ e reinicie com{' '}
            <Text style={styles.warningCode}>npx expo start -c</Text>.
          </Text>
        </View>
      )}

      {/* ─────────────── Lista de músicas ─────────────── */}
      {total === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="music-off" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma música por aqui</Text>
          <Text style={styles.emptyText}>
            Adicione músicas em src/data/playlist.js para começar a tocar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={player.playlist}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─────────────── Player do rodapé ─────────────── */}
      <MiniPlayer
        track={player.track}
        isPlaying={player.isPlaying}
        position={player.position}
        duration={player.duration}
        onTogglePlay={player.togglePlay}
        onNext={() => player.playNext()}
        onOpen={() => setExpanded(true)}
      />

      {/* ─────────────── Player completo ─────────────── */}
      <FullPlayer
        visible={expanded}
        onClose={() => setExpanded(false)}
        track={player.track}
        isPlaying={player.isPlaying}
        isLoading={player.isLoading}
        position={player.position}
        duration={player.duration}
        shuffle={player.shuffle}
        repeat={player.repeat}
        volume={player.volume}
        onTogglePlay={player.togglePlay}
        onNext={() => player.playNext()}
        onPrevious={player.playPrevious}
        onSeek={player.seekTo}
        onToggleShuffle={player.toggleShuffle}
        onCycleRepeat={player.cycleRepeat}
        onVolume={player.setVolume}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  shuffleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    marginLeft: 12,
  },
  shuffleButtonOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  listContent: {
    paddingTop: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 76,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  warningText: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  warningCode: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
});