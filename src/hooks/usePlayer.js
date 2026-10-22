import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { PLAYLIST, sourceOf } from '../data/playlist';
import { isPlaceholder } from '../utils/audioValidation';

const DEFAULT_VOLUME = 1;

/** Embaralha uma lista de índices, mas garante que o índice atual venha primeiro. */
function shuffleFrom(currentIndex) {
  const others = PLAYLIST.map((_, i) => i).filter((i) => i !== currentIndex);

  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  return currentIndex === null ? others : [currentIndex, ...others];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


export function usePlayer() {
  // Cria UM player de áudio (sem música inicial) e um "espião" de status.
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const [index, setIndex] = useState(null); // índice da música atual na playlist
  const [order, setOrder] = useState(() => PLAYLIST.map((_, i) => i)); // ordem de reprodução
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  // Refs: guardam os valores mais recentes para usar dentro de callbacks
  // sem precisar recriá-los a cada renderização.
  const indexRef = useRef(null);
  const orderRef = useRef(order);
  const repeatRef = useRef(repeat);
  const autoplayRef = useRef(false);
  const lastErrorRef = useRef(null);
  const placeholderWarned = useRef(false);

  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { orderRef.current = order; }, [order]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const track = index === null ? null : PLAYLIST[index] ?? null;

 
  useEffect(() => {
    // Tocar mesmo com o celular no silencioso/vibrando.
    // shouldPlayInBackground deixa a música continuar se o app for para o segundo plano.
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {
      // Em web / em alguns emuladores essa configuração não existe: ignoramos.
    });
  }, []);

  /* ───────────────────────── Tocar uma música ───────────────────────── */

  const playTrack = useCallback(
    (target, { autoplay = true } = {}) => {
      const wanted = PLAYLIST[target];
      const source = wanted ? sourceOf(wanted) : null;

      if (!wanted || !source) {
        Alert.alert(
          'Música sem arquivo',
          `A música "${wanted?.title ?? '?'}" não tem "file" nem "url" definida em src/data/playlist.js.`
        );
        return;
      }

      // Os .mp3 de exemplo são silenciosos, mas funcionam: deixa tocar normal
      // e só lembra uma vez que são placeholders.
      if (isPlaceholder(wanted) && !placeholderWarned.current) {
        placeholderWarned.current = true;
        Alert.alert(
          'Música de exemplo',
          'Este arquivo ainda é um .mp3 mudo de exemplo.\n\n' +
            'Copie sua música para assets/audio/ e rode:\n\n' +
            'npx expo start -c'
        );
      }

      autoplayRef.current = autoplay;
      lastErrorRef.current = null;

      try {
        // Troca a fonte do player e começa a carregar.
        player.replace(source);
        setIndex(target);
      } catch (error) {
        lastErrorRef.current = String(error);
        Alert.alert(
          'Não deu para tocar',
          `Erro ao carregar "${wanted.title}".\n\n${String(error)}`
        );
      }
    },
    [player]
  );

  // Assim que a música terminar de carregar, começa a tocar.
  useEffect(() => {
    if (!status.isLoaded || !autoplayRef.current) return;
    autoplayRef.current = false;
    player.play();
  }, [status.isLoaded, player]);

  
  useEffect(() => {
    if (!status.error || status.error === lastErrorRef.current) return;
    lastErrorRef.current = status.error;
    Alert.alert(
      'Arquivo de áudio inválido',
      `Não foi possível reproduzir "${track?.title ?? ''}".\n\n` +
        `${status.error}\n\n` +
        'Verifique se o arquivo .mp3 existe em assets/audio/ e se não está vazio/corrompido.'
    );
  }, [status.error, track?.title]);


  const playNext = useCallback(
    ({ auto = false } = {}) => {
      const list = orderRef.current;
      if (!list.length) return;

      if (indexRef.current === null) return playTrack(list[0]);

      const pos = list.indexOf(indexRef.current);
      const isLast = pos === list.length - 1;

      // Terminou a última música e o repeat está desligado: para no 0:00.
      if (isLast && auto && repeatRef.current === 'off') {
        player.pause();
        player.seekTo(0);
        return;
      }

      // No fim da lista, volta para a primeira (igual ao Spotify).
      playTrack(isLast ? list[0] : list[pos + 1]);
    },
    [playTrack, player]
  );

  const playPrevious = useCallback(() => {
    const list = orderRef.current;
    if (!list.length) return;

    // Se já está ouvindo há mais de 3s, volta só para o começo da música.
    if (status.currentTime > 3) {
      player.seekTo(0);
      return;
    }

    if (indexRef.current === null) return playTrack(list[0]);

    const pos = list.indexOf(indexRef.current);
    playTrack(pos === 0 ? list[list.length - 1] : list[pos - 1]);
  }, [playTrack, player, status.currentTime]);


  useEffect(() => {
    if (!status.didJustFinish) return;

    if (repeatRef.current === 'one') {
      player.seekTo(0);
      player.play();
      return;
    }
    playNext({ auto: true });
  }, [status.didJustFinish, playNext, player]);


  const togglePlay = useCallback(() => {
    if (indexRef.current === null) {
      playTrack(orderRef.current[0]);
      return;
    }
    if (status.playing) player.pause();
    else player.play();
  }, [playNext, playTrack, player, status.playing]);

  const seekTo = useCallback(
    (seconds) => {
      const total = status.duration || 0;
      player.seekTo(clamp(seconds, 0, total));
    },
    [player, status.duration]
  );

  const setVolume = useCallback(
    (value) => {
      const v = clamp(value, 0, 1);
      player.volume = v;
      setVolumeState(v);
    },
    [player]
  );

  const toggleShuffle = useCallback(() => {
    const next = !shuffle;
    setShuffle(next);
    setOrder(next ? shuffleFrom(indexRef.current) : PLAYLIST.map((_, i) => i));
  }, [shuffle]);

  const cycleRepeat = useCallback(() => {
    setRepeat((current) =>
      current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'
    );
  }, []);

  // Tela de bloqueio do celular (Android/iOS) com nome e capa da música.
  useEffect(() => {
    if (Platform.OS === 'web' || !track) return;
    try {
      player.setActiveForLockScreen(true, {
        title: track.title,
        artist: track.artist,
        albumTitle: track.album ?? '',
      });
    } catch {
      // Recurso indisponível em web/emuladores.
    }
  }, [player, track]);

  return {
    // dados
    playlist: PLAYLIST,
    track,
    index,
    duration: status.duration ?? 0,
    position: status.currentTime ?? 0,
    isPlaying: status.playing ?? false,
    isLoading: status.isBuffering || !status.isLoaded,
    // controles
    togglePlay,
    playTrack,
    playNext,
    playPrevious,
    seekTo,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    volume,
    setVolume,
  };
}