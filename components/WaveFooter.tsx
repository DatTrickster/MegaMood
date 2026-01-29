import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const FOOTER_WAVE_HEIGHT = 100;

// Light mode – warm orange/yellow
const LIGHT_COLORS = {
  wave1: '#FFE08A',
  wave2: '#FFD36A',
  wave3: '#FF8A1F',
};

// Dark mode – GitHub-inspired cool grays
const DARK_COLORS = {
  wave1: '#21262d',
  wave2: '#30363d',
  wave3: '#484f58',
};

/**
 * Wave strip footer – same style on Dashboard and Settings.
 * Adapts colors based on light/dark mode.
 */
export default function WaveFooter() {
  const { isDark } = useTheme();
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <View style={styles.wavesWrap} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={FOOTER_WAVE_HEIGHT}
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={styles.wavesSvg}
      >
        <Path d="M0 200 L0 130 Q280 175 400 70 L400 200 Z" fill={colors.wave1} />
        <Path d="M0 200 L0 162 Q280 190 400 110 L400 200 Z" fill={colors.wave2} />
        <Path d="M0 200 L0 188 Q280 200 400 155 L400 200 Z" fill={colors.wave3} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wavesWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_WAVE_HEIGHT,
    zIndex: 0,
  },
  wavesSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: FOOTER_WAVE_HEIGHT,
  },
});
