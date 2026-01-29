import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  G,
  Path,
  Rect,
} from 'react-native-svg';

type Props = {
  size?: number;
};

/**
 * MegaMood logo: sun + calendar + checkmark (user SVG, no background).
 * Use on start screen over gradient background.
 */
export default function MegaMoodLogo({ size = 200 }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 1024 1024"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <LinearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFF6D6" />
            <Stop offset="100%" stopColor="#FFE7A3" />
          </LinearGradient>
          <RadialGradient id="sunGrad" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FFF4A8" />
            <Stop offset="100%" stopColor="#FFB347" />
          </RadialGradient>
        </Defs>
        {/* Sun (behind calendar) */}
        <Circle cx="512" cy="360" r="190" fill="url(#sunGrad)" />
        {/* Sun rays */}
        <G stroke="#FFE28A" strokeWidth="16" strokeLinecap="round">
          <Path d="M512 120 L512 70" />
          <Path d="M650 170 L700 130" />
          <Path d="M720 260 L770 240" />
          <Path d="M720 360 L780 360" />
          <Path d="M720 460 L770 480" />
          <Path d="M650 550 L700 590" />
          <Path d="M374 170 L324 130" />
          <Path d="M304 260 L254 240" />
          <Path d="M304 360 L244 360" />
          <Path d="M304 460 L254 480" />
          <Path d="M374 550 L324 590" />
        </G>
        {/* Happy face */}
        <G stroke="#E07A00" strokeWidth="14" strokeLinecap="round" fill="none">
          <Path d="M440 350 Q470 320 500 350" />
          <Path d="M524 350 Q554 320 584 350" />
          <Path d="M430 400 Q512 470 594 400" />
        </G>
        {/* Calendar (no filter - rn-svg has no feDropShadow) */}
        <Rect x="260" y="460" rx="50" width="504" height="330" fill="url(#cardGrad)" />
        <Rect x="260" y="460" rx="50" width="504" height="100" fill="#FFD27A" />
        {/* Rings */}
        <Rect x="360" y="430" width="60" height="90" rx="28" fill="#FFF3D1" />
        <Rect x="604" y="430" width="60" height="90" rx="28" fill="#FFF3D1" />
        {/* Check */}
        <Path
          d="M390 630 L500 720 L640 560"
          stroke="#FF9C2A"
          strokeWidth="34"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
