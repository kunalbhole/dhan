import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Ported from Dhan App 2/Dhan.html's `.tgl` — 36x20 pill, 16px knob,
// spring-eased slide (--ease-spring).
const WIDTH = 36;
const HEIGHT = 20;
const KNOB = 16;
const INSET = 2;

export interface ToggleProps {
  on: boolean;
  onToggle: () => void;
}

function Toggle({ on, onToggle }: ToggleProps) {
  const progress = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: on ? 1 : 0,
      useNativeDriver: false,
      bounciness: 8,
    }).start();
  }, [on, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderStrong, colors.navy],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, WIDTH - KNOB - INSET * 2],
  });

  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 999,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.bgBase,
    marginLeft: INSET,
  },
});

export default Toggle;
