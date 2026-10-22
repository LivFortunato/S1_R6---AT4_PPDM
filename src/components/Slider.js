import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export function Slider({
  value = 0,
  onChange,
  onSlidingStart,
  onSlidingEnd,
  height = 4,
  knob = 12,
  fillColor = colors.text,
  trackColor = colors.divider,
  style,
}) {
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(null); // valor enquanto arrasta o dedo

  // Guarda os callbacks numa ref para o PanResponder nunca ficar "velho".
  const callbacks = useRef({});
  callbacks.current = { onChange, onSlidingStart, onSlidingEnd };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const ratio = ratioFrom(evt, width);
          setDragging(ratio);
          callbacks.current.onSlidingStart?.();
          callbacks.current.onChange?.(ratio);
        },
        onPanResponderMove: (evt) => {
          const ratio = ratioFrom(evt, width);
          setDragging(ratio);
          callbacks.current.onChange?.(ratio);
        },
        onPanResponderRelease: () => {
          callbacks.current.onSlidingEnd?.();
          setDragging(null);
        },
        onPanResponderTerminate: () => {
          callbacks.current.onSlidingEnd?.();
          setDragging(null);
        },
      }),
    [width]
  );

  const shown = Math.min(Math.max(dragging ?? value ?? 0, 0), 1);

  return (
    <View
      onLayout={(evt) => setWidth(evt.nativeEvent.layout.width)}
      style={[styles.wrapper, { height: Math.max(height, 30) }, style]}
      {...responder.panHandlers}
    >
      <View style={[styles.track, { height, backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            { height, width: `${shown * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      <View
        style={[
          styles.knob,
          {
            width: knob,
            height: knob,
            backgroundColor: fillColor,
            left: Math.max(shown * width - knob / 2, 0),
          },
        ]}
      />
    </View>
  );
}

/** Converte a posição do dedo (em px) na barra para uma porcentagem de 0 a 1. */
function ratioFrom(evt, width) {
  if (!width) return 0;
  const { locationX } = evt.nativeEvent;
  return Math.min(Math.max(locationX / width, 0), 1);
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
  knob: {
    position: 'absolute',
    borderRadius: 999,
  },
});