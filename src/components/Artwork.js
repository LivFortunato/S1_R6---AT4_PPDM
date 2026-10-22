import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme';

export function Artwork({ track, size, radius = 6, iconSize }) {
  const style = {
    width: size,
    height: size,
    borderRadius: radius,
  };

  if (!track) return <View style={[styles.placeholder, style]} />;

  if (track.cover) {
    return (
      <Image
        source={track.cover}
        style={[styles.coverImage, style]}
        resizeMode="cover"
      />
    );
  }

  const [from, to] = track.colors ?? [colors.primary, '#0B5E2B'];

  return (
    <LinearGradient colors={[from, to]} style={[styles.gradient, style]}>
      <MaterialCommunityIcons
        name="music-note"
        size={iconSize ?? Math.round(size * 0.45)}
        color="rgba(255,255,255,0.9)"
      />
    </LinearGradient>
  );
}

/**
 * As 3 barrinhas verdes que aparecem na música que está tocando (estilo Spotify).
 */
export function PlayingBars({ playing, color = colors.primary, height = 14 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!playing) {
      anim.stopAnimation();
      anim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [playing, anim]);

  // Cada barra usa uma parte diferente do ciclo, por isso ficam dessincronizadas.
  const patterns = [
    { input: [0, 0.25, 0.5, 0.75, 1], output: [0.3, 1, 0.4, 0.85, 0.3] },
    { input: [0, 0.33, 0.66, 1], output: [0.9, 0.35, 1, 0.9] },
    { input: [0, 0.2, 0.45, 0.7, 1], output: [0.5, 1, 0.35, 0.8, 0.5] },
  ];

  return (
    <View style={[styles.bars, { height }]}>
      {patterns.map(({ input, output }, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: input,
                outputRange: output,
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.divider,
  },
  coverImage: {
    backgroundColor: colors.divider,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 16,
  },
  bar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 1,
    minHeight: 3,
  },
});