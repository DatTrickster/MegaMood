import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';
import MegaMoodLogo from '../components/MegaMoodLogo';

type StartScreenProps = {
  onGetStarted: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StartScreen({ onGetStarted }: StartScreenProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {/* Solid white top */}
      <View style={styles.whiteBg} />
      {/* Wave – inward curve toward top, dip at middle-right */}
      <View style={styles.wavesWrap} pointerEvents="none">
        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT * 0.45}
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          style={styles.wavesSvg}
        >
          {/* Back – left down a little, inward dip, rises toward right */}
          <Path
            d="M0 200 L0 130 Q280 175 400 70 L400 200 Z"
            fill="#FFE08A"
          />
          {/* Middle – left down a little, inward dip, rises toward right */}
          <Path
            d="M0 200 L0 162 Q280 190 400 110 L400 200 Z"
            fill="#FFD36A"
          />
          {/* Front – left down a little, inward dip, rises toward right */}
          <Path
            d="M0 200 L0 188 Q280 200 400 155 L400 200 Z"
            fill="#FF8A1F"
          />
        </Svg>
      </View>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <MegaMoodLogo size={240} />
        </View>
        <Text style={[styles.title, isDark && styles.titleDark]}>MegaMood</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Welcome in — ready when you are
        </Text>
        <Pressable
          onPress={onGetStarted}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
        >
          <Text style={styles.buttonText}>Let's get started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  whiteBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  wavesWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  wavesSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineLarge,
    fontSize: 32,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: colors.primaryLight,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 18,
    color: '#1C1B1F',
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  subtitleDark: {
    color: '#E6E1E5',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl + 8,
    minWidth: 220,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl + spacing.sm,
    elevation: 4,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    ...typography.labelLarge,
    fontSize: 17,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
});
